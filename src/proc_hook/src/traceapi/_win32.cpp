//////////////////////////////////////////////////////////////////////////////
//
//  Detours Test Program (_win32.cpp of traceapi.dll)
//
//  Microsoft Research Detours Package, Version 3.0.
//
//  Copyright (c) Microsoft Corporation.  All rights reserved.
//

#if _MSC_VER >= 1300
#include <winsock2.h>
#endif
#include "logger.h"
#include "_win32.h"
#include "detours.h"
#include "syelog.h"
#include "utility.h"
#include <stdio.h>

extern HMODULE s_hInst;
extern WCHAR s_wzDllPath[MAX_PATH];
extern CHAR s_szDllPath[MAX_PATH];


//////////////////////////////////////////////////////////////
PDETOUR_CREATE_PROCESS_INTERNAL_ROUTINEA Real_CreateProcessInternalA = NULL;
PDETOUR_CREATE_PROCESS_INTERNAL_ROUTINEW Real_CreateProcessInternalW = NULL;
PDETOUR_RTL_DECOMPRESS_BUFFER_ROUTINE Real_RtlDecompressBuffer = NULL;

///////////////////////////////////////////////////////////////// Trampolines.
//
extern "C" {
BOOL (__stdcall * Real_CreateProcessA)(LPCSTR a0,
                                       LPSTR a1,
                                       LPSECURITY_ATTRIBUTES a2,
                                       LPSECURITY_ATTRIBUTES a3,
                                       BOOL a4,
                                       DWORD a5,
                                       LPVOID a6,
                                       LPCSTR a7,
                                       LPSTARTUPINFOA a8,
                                       LPPROCESS_INFORMATION a9)
    = CreateProcessA;

BOOL (__stdcall * Real_CreateProcessW)(LPCWSTR a0,
                                       LPWSTR a1,
                                       LPSECURITY_ATTRIBUTES a2,
                                       LPSECURITY_ATTRIBUTES a3,
                                       BOOL a4,
                                       DWORD a5,
                                       LPVOID a6,
                                       LPCWSTR a7,
                                       LPSTARTUPINFOW a8,
                                       LPPROCESS_INFORMATION a9)
    = CreateProcessW;

BOOL (__stdcall * Real_CreateProcessAsUserA)(
  __in_opt     HANDLE hToken,
  __in_opt     LPCSTR lpApplicationName,
  __inout_opt  LPSTR lpCommandLine,
  __in_opt     LPSECURITY_ATTRIBUTES lpProcessAttributes,
  __in_opt     LPSECURITY_ATTRIBUTES lpThreadAttributes,
  __in         BOOL bInheritHandles,
  __in         DWORD dwCreationFlags,
  __in_opt     LPVOID lpEnvironment,
  __in_opt     LPCSTR lpCurrentDirectory,
  __in         LPSTARTUPINFOA lpStartupInfo,
  __out        LPPROCESS_INFORMATION lpProcessInformation
                                       ) = CreateProcessAsUserA;

BOOL (__stdcall * Real_CreateProcessAsUserW)(
  __in_opt     HANDLE hToken,
  __in_opt     LPCWSTR lpApplicationName,
  __inout_opt  LPWSTR lpCommandLine,
  __in_opt     LPSECURITY_ATTRIBUTES lpProcessAttributes,
  __in_opt     LPSECURITY_ATTRIBUTES lpThreadAttributes,
  __in         BOOL bInheritHandles,
  __in         DWORD dwCreationFlags,
  __in_opt     LPVOID lpEnvironment,
  __in_opt     LPCWSTR lpCurrentDirectory,
  __in         LPSTARTUPINFOW lpStartupInfo,
  __out        LPPROCESS_INFORMATION lpProcessInformation
) = CreateProcessAsUserW;

BOOL (WINAPI * Real_CreateProcessWithLogonW)(
  __in         LPCWSTR lpUsername,
  __in_opt     LPCWSTR lpDomain,
  __in         LPCWSTR lpPassword,
  __in         DWORD dwLogonFlags,
  __in_opt     LPCWSTR lpApplicationName,
  __inout_opt  LPWSTR lpCommandLine,
  __in         DWORD dwCreationFlags,
  __in_opt     LPVOID lpEnvironment,
  __in_opt     LPCWSTR lpCurrentDirectory,
  __in         LPSTARTUPINFOW lpStartupInfo,
  __out        LPPROCESS_INFORMATION lpProcessInfo
) = CreateProcessWithLogonW;

BOOL (WINAPI * Real_CreateProcessWithTokenW)(
    __in         HANDLE hToken,
    __in         DWORD dwLogonFlags,
    __in_opt     LPCWSTR lpApplicationName,
    __inout_opt  LPWSTR lpCommandLine,
    __in         DWORD dwCreationFlags,
    __in_opt     LPVOID lpEnvironment,
    __in_opt     LPCWSTR lpCurrentDirectory,
    __in         LPSTARTUPINFOW lpStartupInfo,
    __out        LPPROCESS_INFORMATION lpProcessInfo
    ) = /*CreateProcessWithTokenW*/NULL;

HANDLE (__stdcall * Real_CreateRemoteThread)(HANDLE a0,
                                             LPSECURITY_ATTRIBUTES a1,
                                             ULONG_PTR a2,
                                             LPTHREAD_START_ROUTINE a3,
                                             LPVOID a4,
                                             DWORD a5,
                                             LPDWORD a6)
    = CreateRemoteThread;

HANDLE (__stdcall * Real_CreateThread)(LPSECURITY_ATTRIBUTES a0,
                                       ULONG_PTR a1,
                                       LPTHREAD_START_ROUTINE a2,
                                       LPVOID a3,
                                       DWORD a4,
                                       LPDWORD a5)
    = CreateThread;

HMODULE (__stdcall * Real_LoadLibraryExW)(LPCWSTR a0,
                                          HANDLE a1,
                                          DWORD a2)
    = LoadLibraryExW;

}

///////////////////////////////////////////////////////////////////// Detours.
//

BOOL gCallFromCreateProcess = FALSE;

BOOL __stdcall Mine_CreateProcessA(LPCSTR lpApplicationName,
                                   LPSTR lpCommandLine,
                                   LPSECURITY_ATTRIBUTES lpProcessAttributes,
                                   LPSECURITY_ATTRIBUTES lpThreadAttributes,
                                   BOOL bInheritHandles,
                                   DWORD dwCreationFlags,
                                   LPVOID lpEnvironment,
                                   LPCSTR lpCurrentDirectory,
                                   LPSTARTUPINFOA lpStartupInfo,
                                   LPPROCESS_INFORMATION lpProcessInformation)
{
    _PrintEnter("CreateProcessA(%hs,%hs,%p,%p,%p,%p,%p,%hs,%p,%p)\n",
                lpApplicationName,
                lpCommandLine,
                lpProcessAttributes,
                lpThreadAttributes,
                bInheritHandles,
                dwCreationFlags,
                lpEnvironment,
                lpCurrentDirectory,
                lpStartupInfo,
                lpProcessInformation);

    //PROCESS_INFORMATION procInfo;
    //if (lpProcessInformation == NULL) {
    //    lpProcessInformation= &procInfo;
    //    ZeroMemory(&procInfo, sizeof(procInfo));
    //}
    //BOOL rv = 0;
    //__try {
    //    rv = DetourCreateProcessWithDllExA(lpApplicationName,
    //                                     lpCommandLine,
    //                                     lpProcessAttributes,
    //                                     lpThreadAttributes,
    //                                     bInheritHandles,
    //                                     dwCreationFlags,
    //                                     lpEnvironment,
    //                                     lpCurrentDirectory,
    //                                     lpStartupInfo,
    //                                     lpProcessInformation,
    //                                     s_szDllPath,
    //                                     Real_CreateProcessA);
    //} __finally {
    //    _PrintExit("CreateProcessA(,,,,,,,,,) -> %x (proc:%d/%p, thrd:%d/%p\n", rv,
    //               lpProcessInformation->dwProcessId,
    //               lpProcessInformation->hProcess,
    //               lpProcessInformation->dwThreadId,
    //               lpProcessInformation->hThread);
    //};
    //return rv;

    return Real_CreateProcessA(
        lpApplicationName,
        lpCommandLine,
        lpProcessAttributes,
        lpThreadAttributes,
        bInheritHandles,
        dwCreationFlags,
        lpEnvironment,
        lpCurrentDirectory,
        lpStartupInfo,
        lpProcessInformation);
}

BOOL __stdcall Mine_CreateProcessW(LPCWSTR lpApplicationName,
                                   LPWSTR lpCommandLine,
                                   LPSECURITY_ATTRIBUTES lpProcessAttributes,
                                   LPSECURITY_ATTRIBUTES lpThreadAttributes,
                                   BOOL bInheritHandles,
                                   DWORD dwCreationFlags,
                                   LPVOID lpEnvironment,
                                   LPCWSTR lpCurrentDirectory,
                                   LPSTARTUPINFOW lpStartupInfo,
                                   LPPROCESS_INFORMATION lpProcessInformation)
{
    _PrintEnter("CreateProcessW(%ls,%ls,%p,%p,%p,%p,%p,%ls,%p,%p)\n",
                lpApplicationName,
                lpCommandLine,
                lpProcessAttributes,
                lpThreadAttributes,
                bInheritHandles,
                dwCreationFlags,
                lpEnvironment,
                lpCurrentDirectory,
                lpStartupInfo,
                lpProcessInformation);

    PROCESS_INFORMATION procInfo;
    if (lpProcessInformation == NULL) {
        lpProcessInformation= &procInfo;
        ZeroMemory(&procInfo, sizeof(procInfo));
    }

    gCallFromCreateProcess = TRUE;
    BOOL rv = 0;
    __try {
        rv = DetourCreateProcessWithDllW(lpApplicationName,
                                         lpCommandLine,
                                         lpProcessAttributes,
                                         lpThreadAttributes,
                                         bInheritHandles,
                                         dwCreationFlags,
                                         lpEnvironment,
                                         lpCurrentDirectory,
                                         lpStartupInfo,
                                         lpProcessInformation,
                                         s_szDllPath,
                                         Real_CreateProcessW);
    } __finally {
        _PrintExit("CreateProcessW(,,,,,,,,,) -> %x (proc:%d/%p, thrd:%d/%p\n", rv,
                   lpProcessInformation->dwProcessId,
                   lpProcessInformation->hProcess,
                   lpProcessInformation->dwThreadId,
                   lpProcessInformation->hThread);
    };
    return rv;

    //return Real_CreateProcessW(
    //    lpApplicationName,
    //    lpCommandLine,
    //    lpProcessAttributes,
    //    lpThreadAttributes,
    //    bInheritHandles,
    //    dwCreationFlags,
    //    lpEnvironment,
    //    lpCurrentDirectory,
    //    lpStartupInfo,
    //    lpProcessInformation);
}

BOOL __stdcall Mine_CreateProcessInternalA(HANDLE hToken,
                                   LPCSTR lpApplicationName,
                                   LPSTR lpCommandLine,
                                   LPSECURITY_ATTRIBUTES lpProcessAttributes,
                                   LPSECURITY_ATTRIBUTES lpThreadAttributes,
                                   BOOL bInheritHandles,
                                   DWORD dwCreationFlags,
                                   LPVOID lpEnvironment,
                                   LPCSTR lpCurrentDirectory,
                                   LPSTARTUPINFOA lpStartupInfo,
                                   LPPROCESS_INFORMATION lpProcessInformation,
                                   PHANDLE hNewToken)
{
    _PrintEnter("CreateProcessInternalA(%p,%hs,%hs,%p,%p,%p,%p,%p,%hs,%p,%p,%p)\n",
        hToken,
        lpApplicationName,
        lpCommandLine,
        lpProcessAttributes,
        lpThreadAttributes,
        bInheritHandles,
        dwCreationFlags,
        lpEnvironment,
        lpCurrentDirectory,
        lpStartupInfo,
        lpProcessInformation,
        hNewToken);

    // backup file
    //BackupFileA(lpApplicationName, lpCommandLine);

    return Real_CreateProcessInternalA(
        hToken,
        lpApplicationName,
        lpCommandLine,
        lpProcessAttributes,
        lpThreadAttributes,
        bInheritHandles,
        dwCreationFlags,
        lpEnvironment,
        lpCurrentDirectory,
        lpStartupInfo,
        lpProcessInformation,
        hNewToken);
}

BOOL __stdcall Mine_CreateProcessInternalW(HANDLE hToken,
                                   LPCWSTR lpApplicationName,
                                   LPWSTR lpCommandLine,
                                   LPSECURITY_ATTRIBUTES lpProcessAttributes,
                                   LPSECURITY_ATTRIBUTES lpThreadAttributes,
                                   BOOL bInheritHandles,
                                   DWORD dwCreationFlags,
                                   LPVOID lpEnvironment,
                                   LPCWSTR lpCurrentDirectory,
                                   LPSTARTUPINFOW lpStartupInfo,
                                   LPPROCESS_INFORMATION lpProcessInformation,
                                   PHANDLE hNewToken)
{
    _PrintEnter("CreateProcessInternalW(%p,%ls,%ls,%p,%p,%p,%p,%p,%ls,%p,%p,%p)\n",
        hToken,
        lpApplicationName,
        lpCommandLine,
        lpProcessAttributes,
        lpThreadAttributes,
        bInheritHandles,
        dwCreationFlags,
        lpEnvironment,
        lpCurrentDirectory,
        lpStartupInfo,
        lpProcessInformation,
        hNewToken);

    // backup file
    BackupFileW(lpApplicationName, lpCommandLine);
    
    BOOL ret_val = Real_CreateProcessInternalW(
        hToken,
        lpApplicationName,
        lpCommandLine,
        lpProcessAttributes,
        lpThreadAttributes,
        bInheritHandles,
        dwCreationFlags,
        lpEnvironment,
        lpCurrentDirectory,
        lpStartupInfo,
        lpProcessInformation,
        hNewToken);

    //Sleep(1000);

    if (gCallFromCreateProcess) {
        OutputDebugString(L"Don't inject DLL if this call from CreateProcess");
    } else {
        char buf[256] = "\0";
        sprintf_s(buf, "Inject %s into PID:%d\n", s_szDllPath, GetProcessId(lpProcessInformation->hProcess));
        OutputDebugStringA(buf);
        InjectDll(s_szDllPath, lpProcessInformation->hProcess);
    }

    gCallFromCreateProcess = FALSE;

    return ret_val;
}

BOOL __stdcall Mine_CreateProcessAsUserA(
  __in_opt     HANDLE hToken,
  __in_opt     LPCSTR lpApplicationName,
  __inout_opt  LPSTR lpCommandLine,
  __in_opt     LPSECURITY_ATTRIBUTES lpProcessAttributes,
  __in_opt     LPSECURITY_ATTRIBUTES lpThreadAttributes,
  __in         BOOL bInheritHandles,
  __in         DWORD dwCreationFlags,
  __in_opt     LPVOID lpEnvironment,
  __in_opt     LPCSTR lpCurrentDirectory,
  __in         LPSTARTUPINFOA lpStartupInfo,
  __out        LPPROCESS_INFORMATION lpProcessInformation
                                        )
{
    _PrintEnter("CreateProcessAsUserA(%ls,%ls,%p,%p,%p,%p,%p,%ls,%p,%p)\n",
                lpApplicationName,
                lpCommandLine,
                lpProcessAttributes,
                lpThreadAttributes,
                bInheritHandles,
                dwCreationFlags,
                lpEnvironment,
                lpCurrentDirectory,
                lpStartupInfo,
                lpProcessInformation);

    PROCESS_INFORMATION procInfo;
    if (lpProcessInformation == NULL) {
        lpProcessInformation= &procInfo;
        ZeroMemory(&procInfo, sizeof(procInfo));
    }

    BOOL rv = 0;
    __try {
        rv = Real_CreateProcessAsUserA(hToken,
                                       lpApplicationName,
                                       lpCommandLine,
                                       lpProcessAttributes,
                                       lpThreadAttributes,
                                       bInheritHandles,
                                       dwCreationFlags,
                                       lpEnvironment,
                                       lpCurrentDirectory,
                                       lpStartupInfo,
                                       lpProcessInformation);
    } __finally {
        _PrintExit("CreateProcessAsUserAW(,,,,,,,,,) -> %x (proc:%d/%p, thrd:%d/%p\n", rv,
                   lpProcessInformation->dwProcessId,
                   lpProcessInformation->hProcess,
                   lpProcessInformation->dwThreadId,
                   lpProcessInformation->hThread);
    };
    return rv;
}

BOOL __stdcall Mine_CreateProcessAsUserW(
  __in_opt     HANDLE hToken,
  __in_opt     LPCWSTR lpApplicationName,
  __inout_opt  LPWSTR lpCommandLine,
  __in_opt     LPSECURITY_ATTRIBUTES lpProcessAttributes,
  __in_opt     LPSECURITY_ATTRIBUTES lpThreadAttributes,
  __in         BOOL bInheritHandles,
  __in         DWORD dwCreationFlags,
  __in_opt     LPVOID lpEnvironment,
  __in_opt     LPCWSTR lpCurrentDirectory,
  __in         LPSTARTUPINFOW lpStartupInfo,
  __out        LPPROCESS_INFORMATION lpProcessInformation
                                        )
{
    _PrintEnter("CreateProcessAsUserW(%ls,%ls,%p,%p,%p,%p,%p,%ls,%p,%p)\n",
                lpApplicationName,
                lpCommandLine,
                lpProcessAttributes,
                lpThreadAttributes,
                bInheritHandles,
                dwCreationFlags,
                lpEnvironment,
                lpCurrentDirectory,
                lpStartupInfo,
                lpProcessInformation);

    PROCESS_INFORMATION procInfo;
    if (lpProcessInformation == NULL) {
        lpProcessInformation= &procInfo;
        ZeroMemory(&procInfo, sizeof(procInfo));
    }

    BOOL rv = 0;
    __try {
        rv = Real_CreateProcessAsUserW(hToken,
                                       lpApplicationName,
                                       lpCommandLine,
                                       lpProcessAttributes,
                                       lpThreadAttributes,
                                       bInheritHandles,
                                       dwCreationFlags,
                                       lpEnvironment,
                                       lpCurrentDirectory,
                                       lpStartupInfo,
                                       lpProcessInformation);
    } __finally {
        _PrintExit("CreateProcessAsUserW(,,,,,,,,,) -> %x (proc:%d/%p, thrd:%d/%p\n", rv,
                   lpProcessInformation->dwProcessId,
                   lpProcessInformation->hProcess,
                   lpProcessInformation->dwThreadId,
                   lpProcessInformation->hThread);
    };
    return rv;
}

BOOL WINAPI Mine_CreateProcessWithLogonW(
  __in         LPCWSTR lpUsername,
  __in_opt     LPCWSTR lpDomain,
  __in         LPCWSTR lpPassword,
  __in         DWORD dwLogonFlags,
  __in_opt     LPCWSTR lpApplicationName,
  __inout_opt  LPWSTR lpCommandLine,
  __in         DWORD dwCreationFlags,
  __in_opt     LPVOID lpEnvironment,
  __in_opt     LPCWSTR lpCurrentDirectory,
  __in         LPSTARTUPINFOW lpStartupInfo,
  __out        LPPROCESS_INFORMATION lpProcessInfo
                                        )
{
    _PrintEnter("CreateProcessWithLogonW(%ls,%ls,%ls,%d,%ls,%ls,%p,%p,%ls,%p,%p)\n",
                lpUsername,
                lpDomain,
                lpPassword,
                dwLogonFlags,
                lpApplicationName,
                lpCommandLine,
                dwCreationFlags,
                lpEnvironment,
                lpCurrentDirectory,
                lpStartupInfo,
                lpProcessInfo);

    PROCESS_INFORMATION procInfo;
    if (lpProcessInfo == NULL) {
        lpProcessInfo= &procInfo;
        ZeroMemory(&procInfo, sizeof(procInfo));
    }

    BOOL rv = 0;
    __try {
        rv = Real_CreateProcessWithLogonW(
                lpUsername,
                lpDomain,
                lpPassword,
                dwLogonFlags,
                lpApplicationName,
                lpCommandLine,
                dwCreationFlags,
                lpEnvironment,
                lpCurrentDirectory,
                lpStartupInfo,
                lpProcessInfo);
    } __finally {
        _PrintExit("CreateProcessWithLogonW(,,,,,,,,,) -> %x (proc:%d/%p, thrd:%d/%p\n", rv,
                   lpProcessInfo->dwProcessId,
                   lpProcessInfo->hProcess,
                   lpProcessInfo->dwThreadId,
                   lpProcessInfo->hThread);
    };
    return rv;
}

BOOL WINAPI Mine_CreateProcessWithTokenW(
  __in         HANDLE hToken,
  __in         DWORD dwLogonFlags,
  __in_opt     LPCWSTR lpApplicationName,
  __inout_opt  LPWSTR lpCommandLine,
  __in         DWORD dwCreationFlags,
  __in_opt     LPVOID lpEnvironment,
  __in_opt     LPCWSTR lpCurrentDirectory,
  __in         LPSTARTUPINFOW lpStartupInfo,
  __out        LPPROCESS_INFORMATION lpProcessInfo
)
{
    _PrintEnter("CreateProcessWithTokenW(%ls,%ls,%p,%p,%ls,%p,%p)\n",
                lpApplicationName,
                lpCommandLine,
                dwCreationFlags,
                lpEnvironment,
                lpCurrentDirectory,
                lpStartupInfo,
                lpProcessInfo);

    PROCESS_INFORMATION procInfo;
    if (lpProcessInfo == NULL) {
        lpProcessInfo= &procInfo;
        ZeroMemory(&procInfo, sizeof(procInfo));
    }

    BOOL rv = 0;
    __try {
        rv = Real_CreateProcessWithTokenW(hToken,
                                          dwLogonFlags,
                                          lpApplicationName,
                                          lpCommandLine,
                                          dwCreationFlags,
                                          lpEnvironment,
                                          lpCurrentDirectory,
                                          lpStartupInfo,
                                          lpProcessInfo);
    } __finally {
        _PrintExit("CreateProcessWithTokenW(,,,,,,,,,) -> %x (proc:%d/%p, thrd:%d/%p\n", rv,
                   lpProcessInfo->dwProcessId,
                   lpProcessInfo->hProcess,
                   lpProcessInfo->dwThreadId,
                   lpProcessInfo->hThread);
    };
    return rv;
}

HANDLE __stdcall Mine_CreateRemoteThread(HANDLE a0,
                                         LPSECURITY_ATTRIBUTES a1,
                                         ULONG_PTR a2,
                                         LPTHREAD_START_ROUTINE a3,
                                         LPVOID a4,
                                         DWORD a5,
                                         LPDWORD a6)
{
    _PrintEnter("CreateRemoteThread(%p,%p,%p,%p,%p,%p,%p)\n", a0, a1, a2, a3, a4, a5, a6);

    HANDLE rv = 0;
    __try {
        rv = Real_CreateRemoteThread(a0, a1, a2, a3, a4, a5, a6);
    } __finally {
        _PrintExit("CreateRemoteThread(,,,,,,) -> %p\n", rv);
    };
    return rv;
}

HANDLE __stdcall Mine_CreateThread(LPSECURITY_ATTRIBUTES a0,
                                   ULONG_PTR a1,
                                   LPTHREAD_START_ROUTINE a2,
                                   LPVOID a3,
                                   DWORD a4,
                                   LPDWORD a5)
{
    _PrintEnter("CreateThread(%p,%p,%p,%p,%p,%p)\n", a0, a1, a2, a3, a4, a5);

    HANDLE rv = 0;
    __try {
        rv = Real_CreateThread(a0, a1, a2, a3, a4, a5);
    } __finally {
        _PrintExit("CreateThread(,,,,,) -> %p\n", rv);
    };
    return rv;
}

HMODULE __stdcall Mine_LoadLibraryExW(LPCWSTR a0,
                                      HANDLE a1,
                                      DWORD a2)
{
    _PrintEnter("LoadLibraryExW(%ls,%p,%p)\n", a0, a1, a2);

    HMODULE rv = 0;
    __try {
        rv = Real_LoadLibraryExW(a0, a1, a2);
    } __finally {
        _PrintExit("LoadLibraryExW(,,) -> %p\n", rv);
    };
    return rv;
}

NTSTATUS __stdcall Mine_RtlDecompressBuffer(
    _In_  USHORT CompressionFormat,
    _Out_ PUCHAR UncompressedBuffer,
    _In_  ULONG  UncompressedBufferSize,
    _In_  PUCHAR CompressedBuffer,
    _In_  ULONG  CompressedBufferSize,
    _Out_ PULONG FinalUncompressedSize
    )
{
    NTSTATUS status = Real_RtlDecompressBuffer(
        CompressionFormat,
        UncompressedBuffer,
        UncompressedBufferSize,
        CompressedBuffer,
        CompressedBufferSize,
        FinalUncompressedSize);
    _PrintEnter("RtlDecompressBuffer(%d,%p,%ld,%p,%ld,%ld)\n",
        CompressionFormat,
        UncompressedBuffer,
        UncompressedBufferSize,
        CompressedBuffer,
        CompressedBufferSize,
        *FinalUncompressedSize);
    if (UncompressedBuffer[0] == '\x4d' && UncompressedBuffer[1] == '\x5a' && *FinalUncompressedSize > 2) {
        _PrintEnter("Find PE signature in uncompressed buffer, need to backup.");
        if (BackupContent((const char *)UncompressedBuffer, *FinalUncompressedSize, "unknown.exe")) {
            _PrintEnter("Backup memory content to unknown.exe successfully.");
        } else {
            _PrintEnter("Backup memory content to unknown.exe failed.");
        }
    }
    return status;
}


////////////////////////////////////////////////////////////// AttachDetours.
//
static PCHAR DetRealName(PCHAR psz)
{
    PCHAR pszBeg = psz;
    // Move to end of name.
    while (*psz) {
        psz++;
    }
    // Move back through A-Za-z0-9 names.
    while (psz > pszBeg &&
           ((psz[-1] >= 'A' && psz[-1] <= 'Z') ||
            (psz[-1] >= 'a' && psz[-1] <= 'z') ||
            (psz[-1] >= '0' && psz[-1] <= '9'))) {
        psz--;
    }
    return psz;
}

static VOID Dump(PBYTE pbBytes, LONG nBytes, PBYTE pbTarget)
{
    CHAR szBuffer[256];
    PCHAR pszBuffer = szBuffer;

    for (LONG n = 0; n < nBytes; n += 12) {
#ifdef _CRT_INSECURE_DEPRECATE
        pszBuffer += sprintf_s(pszBuffer, sizeof(szBuffer), "  %p: ", pbBytes + n);
#else
        pszBuffer += sprintf(pszBuffer, "  %p: ", pbBytes + n);
#endif
        for (LONG m = n; m < n + 12; m++) {
            if (m >= nBytes) {
#ifdef _CRT_INSECURE_DEPRECATE
                pszBuffer += sprintf_s(pszBuffer, sizeof(szBuffer), "   ");
#else
                pszBuffer += sprintf(pszBuffer, "   ");
#endif
            }
            else {
#ifdef _CRT_INSECURE_DEPRECATE
                pszBuffer += sprintf_s(pszBuffer, sizeof(szBuffer), "%02x ", pbBytes[m]);
#else
                pszBuffer += sprintf(pszBuffer, "%02x ", pbBytes[m]);
#endif
            }
        }
        if (n == 0) {
#ifdef _CRT_INSECURE_DEPRECATE
            pszBuffer += sprintf_s(pszBuffer, sizeof(szBuffer), "[%p]", pbTarget);
#else
            pszBuffer += sprintf(pszBuffer, "[%p]", pbTarget);
#endif
        }
#ifdef _CRT_INSECURE_DEPRECATE
        pszBuffer += sprintf_s(pszBuffer, sizeof(szBuffer), "\n");
#else
        pszBuffer += sprintf(pszBuffer, "\n");
#endif
    }

    Syelog(SYELOG_SEVERITY_INFORMATION, "%s", szBuffer);
}

static VOID Decode(PBYTE pbCode, LONG nInst)
{
    PBYTE pbSrc = pbCode;
    PBYTE pbEnd;
    PBYTE pbTarget;
    for (LONG n = 0; n < nInst; n++) {
        pbTarget = NULL;
        pbEnd = (PBYTE)DetourCopyInstruction(NULL, NULL, (PVOID)pbSrc, (PVOID*)&pbTarget, NULL);
        Dump(pbSrc, (int)(pbEnd - pbSrc), pbTarget);
        pbSrc = pbEnd;

        if (pbTarget != NULL) {
            break;
        }
    }
}

VOID DetAttach(PVOID *ppvReal, PVOID pvMine, PCHAR psz)
{
    PVOID pvReal = NULL;
    if (ppvReal == NULL) {
        ppvReal = &pvReal;
    }

    LONG l = DetourAttach(ppvReal, pvMine);
    if (l != 0) {
        Syelog(SYELOG_SEVERITY_NOTICE,
               "Attach failed: `%s': error %d\n", DetRealName(psz), l);

        Decode((PBYTE)*ppvReal, 3);
    }
}

VOID DetDetach(PVOID *ppvReal, PVOID pvMine, PCHAR psz)
{
    LONG l = DetourDetach(ppvReal, pvMine);
    if (l != 0) {
#if 0
        Syelog(SYELOG_SEVERITY_NOTICE,
               "Detach failed: `%s': error %d\n", DetRealName(psz), l);
#else
        (void)psz;
#endif
    }
}


#define ATTACH(x)       DetAttach(&(PVOID&)Real_##x,Mine_##x,#x)
#define DETACH(x)       DetDetach(&(PVOID&)Real_##x,Mine_##x,#x)

LONG AttachDetours(VOID)
{
    // get undocumented API
    HINSTANCE hKerl32 = LoadLibrary(L"kernel32.dll");
    if (NULL == hKerl32) {
        Syelog(SYELOG_SEVERITY_FATAL, "### Error loading kernel32.dll\n");
        return FALSE;
    }
    Real_CreateProcessInternalW = (PDETOUR_CREATE_PROCESS_INTERNAL_ROUTINEW)GetProcAddress(hKerl32, "CreateProcessInternalW");
    if (NULL == Real_CreateProcessInternalW) {
        Syelog(SYELOG_SEVERITY_FATAL, "### Error getting function address, CreateProcessInternalW\n");
        return FALSE;
    }
    Real_CreateProcessInternalA = (PDETOUR_CREATE_PROCESS_INTERNAL_ROUTINEA)GetProcAddress(hKerl32, "CreateProcessInternalA");
    if (NULL == Real_CreateProcessInternalA) {
        Syelog(SYELOG_SEVERITY_FATAL, "### Error getting function address, CreateProcessInternalA\n");
        return FALSE;
    }

    HINSTANCE hNtdll = LoadLibrary(L"ntdll.dll");
    if (NULL == hNtdll) {
        Syelog(SYELOG_SEVERITY_FATAL, "### Error loading ntdll.dll\n");
        return FALSE;
    }
    Real_RtlDecompressBuffer = (PDETOUR_RTL_DECOMPRESS_BUFFER_ROUTINE)GetProcAddress(hNtdll, "RtlDecompressBuffer");
    if (NULL == Real_CreateProcessInternalW) {
        Syelog(SYELOG_SEVERITY_FATAL, "### Error getting function address, CreateProcessInternalW\n");
        return FALSE;
    }


    DetourTransactionBegin();
    DetourUpdateThread(GetCurrentThread());

    // For this many APIs, we'll ignore one or two can't be detoured.
    DetourSetIgnoreTooSmall(TRUE);

    ATTACH(CreateProcessA);
    ATTACH(CreateProcessW);
    //ATTACH(CreateProcessInternalA);
    //
    ATTACH(CreateProcessAsUserA);
    ATTACH(CreateProcessAsUserW);
    ATTACH(CreateProcessWithLogonW);
    //ATTACH(CreateProcessWithTokenW);
    //ATTACH(CreateRemoteThread);
    //ATTACH(CreateThread);

    ATTACH(CreateProcessInternalW);
    ATTACH(RtlDecompressBuffer);

    PVOID *ppbFailedPointer = NULL;
    LONG error = DetourTransactionCommitEx(&ppbFailedPointer);
    if (error != 0) {
        printf("traceapi.dll: Attach transaction failed to commit. Error %d (%p/%p)",
               error, ppbFailedPointer, *ppbFailedPointer);
        return error;
    }
    return 0;
}

LONG DetachDetours(VOID)
{
    DetourTransactionBegin();
    DetourUpdateThread(GetCurrentThread());

    // For this many APIs, we'll ignore one or two can't be detoured.
    DetourSetIgnoreTooSmall(TRUE);

    DETACH(CreateProcessA);
    DETACH(CreateProcessW);
    //DETACH(CreateProcessInternalA);
    //DETACH(CreateProcessInternalW);
    DETACH(CreateProcessAsUserA);
    DETACH(CreateProcessAsUserW);
    DETACH(CreateProcessWithLogonW);
    //DETACH(CreateProcessWithTokenW);
    //DETACH(CreateRemoteThread);
    //DETACH(CreateThread);

    if (DetourTransactionCommit() != 0) {
        PVOID *ppbFailedPointer = NULL;
        LONG error = DetourTransactionCommitEx(&ppbFailedPointer);

        printf("traceapi.dll: Detach transaction failed to commit. Error %d (%p/%p)",
               error, ppbFailedPointer, *ppbFailedPointer);
        return error;
    }
    return 0;
}
//
///////////////////////////////////////////////////////////////// End of File.
