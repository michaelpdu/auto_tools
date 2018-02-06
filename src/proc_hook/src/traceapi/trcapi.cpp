//////////////////////////////////////////////////////////////////////////////
//
//  Detours Test Program (trcapi.cpp of trcapi.dll)
//
//  Microsoft Research Detours Package, Version 3.0.
//
//  Copyright (c) Microsoft Corporation.  All rights reserved.
//

//#include "_win32.cpp"
#if _MSC_VER >= 1300
#include <winsock2.h>
#endif
#include <windows.h>
#include <stdio.h>
#include "detours.h"
#include "syelog.h"
#include "_win32.h"
#include "utility.h"

#define _WIN32_WINNT        _WIN32_WINNT_WINXP
#define WIN32
#define NT

#define DBG_TRACE   0


#if (_MSC_VER < 1299)
#define LONG_PTR    LONG
#define ULONG_PTR   ULONG
#define PLONG_PTR   PLONG
#define PULONG_PTR  PULONG
#define INT_PTR     INT
#define UINT_PTR    UINT
#define PINT_PTR    PINT
#define PUINT_PTR   PUINT
#define DWORD_PTR   DWORD
#define PDWORD_PTR  PDWORD
#endif

//////////////////////////////////////////////////////////////////////////////
#pragma warning(disable:4127)   // Many of our asserts are constants.

#define ASSERT_ALWAYS(x)   \
    do {                                                        \
    if (!(x)) {                                                 \
            AssertMessage(#x, __FILE__, __LINE__);              \
            DebugBreak();                                       \
    }                                                           \
    } while (0)

#ifndef NDEBUG
#define ASSERT(x)           ASSERT_ALWAYS(x)
#else
#define ASSERT(x)
#endif

#define UNUSED(c)    (c) = (c)


#if defined(WIN32) | defined(WIN64) | defined(_WIN32) | defined(_WIN64) 
#ifdef TRACEAPI_EXPORTS
#define TRACE_API __declspec(dllexport)
#else
#define TRACE_API __declspec(dllimport)
#endif
#else	/* Linux/Unix */
#define TRACE_API
#endif


HMODULE s_hInst = NULL;
WCHAR s_wzDllPath[MAX_PATH];
CHAR s_szDllPath[MAX_PATH];

BOOL s_bLog = FALSE;
LONG s_nTlsIndent = -1;
LONG s_nTlsThread = -1;
LONG s_nThreadCnt = 0;

//////////////////////////////////////////////////////////////////////////////
//
// DLL module information
//
#ifdef __cplusplus
extern "C" {
#endif

TRACE_API BOOL ThreadAttach(HMODULE hDll)
{
    (void)hDll;

    if (s_nTlsIndent >= 0) {
        TlsSetValue(s_nTlsIndent, (PVOID)0);
    }
    if (s_nTlsThread >= 0) {
        LONG nThread = InterlockedIncrement(&s_nThreadCnt);
        TlsSetValue(s_nTlsThread, (PVOID)(LONG_PTR)nThread);
    }
    return TRUE;
}

TRACE_API BOOL ThreadDetach(HMODULE hDll)
{
    (void)hDll;

    if (s_nTlsIndent >= 0) {
        TlsSetValue(s_nTlsIndent, (PVOID)0);
    }
    if (s_nTlsThread >= 0) {
        TlsSetValue(s_nTlsThread, (PVOID)0);
    }
    return TRUE;
}

TRACE_API BOOL ProcessAttach(HMODULE hDll)
{
    s_bLog = FALSE;
    s_nTlsIndent = TlsAlloc();
    s_nTlsThread = TlsAlloc();
    ThreadAttach(hDll);

    WCHAR wzExeName[MAX_PATH];

    s_hInst = hDll;
    GetModuleFileNameW(hDll, s_wzDllPath, ARRAYSIZE(s_wzDllPath));
    GetModuleFileNameW(NULL, wzExeName, ARRAYSIZE(wzExeName));
    sprintf_s(s_szDllPath, ARRAYSIZE(s_szDllPath), "%ls", s_wzDllPath);

    SyelogOpen("trcapi" DETOURS_STRINGIFY(DETOURS_BITS), SYELOG_FACILITY_APPLICATION);
    ProcessEnumerate();

    LONG error = AttachDetours();
    if (error != NO_ERROR) {
        Syelog(SYELOG_SEVERITY_FATAL, "### Error attaching detours: %d\n", error);
        return TRUE;
    }

    s_bLog = TRUE;
    return TRUE;
}

TRACE_API BOOL ProcessDetach(HMODULE hDll)
{
    ThreadDetach(hDll);
    s_bLog = FALSE;

    LONG error = DetachDetours();
    if (error != NO_ERROR) {
        Syelog(SYELOG_SEVERITY_FATAL, "### Error detaching detours: %d\n", error);
    }

    Syelog(SYELOG_SEVERITY_NOTICE, "### Closing.\n");
    SyelogClose(FALSE);

    if (s_nTlsIndent >= 0) {
        TlsFree(s_nTlsIndent);
    }
    if (s_nTlsThread >= 0) {
        TlsFree(s_nTlsThread);
    }
    return TRUE;
}

#ifdef __cplusplus
};
#endif

BOOL APIENTRY DllMain(HINSTANCE hModule, DWORD dwReason, PVOID lpReserved)
{
    (void)hModule;
    (void)lpReserved;
    BOOL ret;
    if (DetourIsHelperProcess()) {
        return TRUE;
    }

    switch (dwReason) {
      case DLL_PROCESS_ATTACH:
        DetourRestoreAfterWith();
        OutputDebugStringA("trcapi" DETOURS_STRINGIFY(DETOURS_BITS) ".dll:"
                          " DllMain DLL_PROCESS_ATTACH\n");
        return ProcessAttach(hModule);
      case DLL_PROCESS_DETACH:
        ret = ProcessDetach(hModule);
        OutputDebugStringA("trcapi" DETOURS_STRINGIFY(DETOURS_BITS) ".dll:"
                          " DllMain DLL_PROCESS_DETACH\n");
        return ret;
      case DLL_THREAD_ATTACH:
          OutputDebugStringA("trcapi" DETOURS_STRINGIFY(DETOURS_BITS) ".dll:"
              " DllMain DLL_THREAD_ATTACH\n");
          return ThreadAttach(hModule);
      case DLL_THREAD_DETACH:
          OutputDebugStringA("trcapi" DETOURS_STRINGIFY(DETOURS_BITS) ".dll:"
              " DllMain DLL_THREAD_DETACH\n");
          return ThreadDetach(hModule);
    }
    return TRUE;
}
//
///////////////////////////////////////////////////////////////// End of File.
