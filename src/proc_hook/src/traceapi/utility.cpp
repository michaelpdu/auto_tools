#include "utility.h"
#include "syelog.h"
#include <filesystem>
#include "EncodingUtility.h"
#include <stdio.h>
#include "Psapi.h"

extern WCHAR s_wzDllPath[MAX_PATH];
extern CHAR s_szDllPath[MAX_PATH];

PIMAGE_NT_HEADERS NtHeadersForInstance(HINSTANCE hInst)
{
    PIMAGE_DOS_HEADER pDosHeader = (PIMAGE_DOS_HEADER)hInst;
    __try {
        if (pDosHeader->e_magic != IMAGE_DOS_SIGNATURE) {
            SetLastError(ERROR_BAD_EXE_FORMAT);
            return NULL;
        }

        PIMAGE_NT_HEADERS pNtHeader = (PIMAGE_NT_HEADERS)((PBYTE)pDosHeader +
            pDosHeader->e_lfanew);
        if (pNtHeader->Signature != IMAGE_NT_SIGNATURE) {
            SetLastError(ERROR_INVALID_EXE_SIGNATURE);
            return NULL;
        }
        if (pNtHeader->FileHeader.SizeOfOptionalHeader == 0) {
            SetLastError(ERROR_EXE_MARKED_INVALID);
            return NULL;
        }
        return pNtHeader;
    } __except(EXCEPTION_EXECUTE_HANDLER) {
    }
    SetLastError(ERROR_EXE_MARKED_INVALID);

    return NULL;
}


BOOL ProcessEnumerate()
{
    Syelog(SYELOG_SEVERITY_INFORMATION,
        "######################################################### Binaries\n");

    PBYTE pbNext;
    for (PBYTE pbRegion = (PBYTE)0x10000;; pbRegion = pbNext) {
        MEMORY_BASIC_INFORMATION mbi;
        ZeroMemory(&mbi, sizeof(mbi));

        if (VirtualQuery((PVOID)pbRegion, &mbi, sizeof(mbi)) <= 0) {
            break;
        }
        pbNext = (PBYTE)mbi.BaseAddress + mbi.RegionSize;

        // Skip free regions, reserver regions, and guard pages.
        //
        if (mbi.State == MEM_FREE || mbi.State == MEM_RESERVE) {
            continue;
        }
        if (mbi.Protect & PAGE_GUARD || mbi.Protect & PAGE_NOCACHE) {
            continue;
        }
        if (mbi.Protect == PAGE_NOACCESS) {
            continue;
        }

        // Skip over regions from the same allocation...
        {
            MEMORY_BASIC_INFORMATION mbiStep;

            while (VirtualQuery((PVOID)pbNext, &mbiStep, sizeof(mbiStep)) > 0) {
                if ((PBYTE)mbiStep.AllocationBase != pbRegion) {
                    break;
                }
                pbNext = (PBYTE)mbiStep.BaseAddress + mbiStep.RegionSize;
                mbi.Protect |= mbiStep.Protect;
            }
        }

        WCHAR wzDllName[MAX_PATH];
        PIMAGE_NT_HEADERS pinh = NtHeadersForInstance((HINSTANCE)pbRegion);

        if (pinh &&
            GetModuleFileNameW((HINSTANCE)pbRegion,wzDllName,ARRAYSIZE(wzDllName))) {

                Syelog(SYELOG_SEVERITY_INFORMATION,
                    "### %p..%p: %ls\n", pbRegion, pbNext, wzDllName);
        }
        else {
            Syelog(SYELOG_SEVERITY_INFORMATION,
                "### %p..%p: State=%04x, Protect=%08x\n",
                pbRegion, pbNext, mbi.State, mbi.Protect);
        }
    }
    Syelog(SYELOG_SEVERITY_INFORMATION, "###\n");

    LPVOID lpvEnv = GetEnvironmentStrings();
    Syelog(SYELOG_SEVERITY_INFORMATION, "### Env= %08x [%08x %08x]\n",
        lpvEnv, ((PVOID*)lpvEnv)[0], ((PVOID*)lpvEnv)[1]);

    return TRUE;
}

BOOL InstanceEnumerate(HINSTANCE hInst)
{
    WCHAR wzDllName[MAX_PATH];

    PIMAGE_NT_HEADERS pinh = NtHeadersForInstance(hInst);
    if (pinh && GetModuleFileNameW(hInst, wzDllName, ARRAYSIZE(wzDllName))) {
        Syelog(SYELOG_SEVERITY_INFORMATION, "### %p: %ls\n", hInst, wzDllName);
        return TRUE;
    }
    return FALSE;
}

BOOL BackupFileInternal(LPCWSTR lpPath)
{
    Syelog(SYELOG_SEVERITY_DEBUG, "Enter into BackupFileInternal\n");
    if (NULL == lpPath || 0 == wcslen(lpPath)) {
        Syelog(SYELOG_SEVERITY_DEBUG, "Input is NULL or string length is 0\n");
        return FALSE;
    }

    // trim \"
    LPCWSTR lpBegin = NULL, lpEnd = NULL;
    lpBegin = lpPath;
    while (*lpBegin == '\"') {
        lpBegin++;
    }
    lpEnd = lpBegin;
    if (*lpBegin != '\0') {
        lpEnd = lpBegin+1;
    }
    while (*lpEnd != '\"' && *lpEnd != '\0') {
        lpEnd++;
    }
    
    //
    std::wstring file_path(lpBegin, lpEnd-lpBegin);
    Syelog(SYELOG_SEVERITY_DEBUG, "File Path = %ls\n", file_path.c_str());

    // set dest folder
    std::wstring dest = s_wzDllPath;
    dest = dest.substr(0, dest.find_last_of(L"/\\"));


    if (std::wstring::npos != file_path.find(L"iexplore.exe") || 
        std::wstring::npos != file_path.find(L"system32\\cmd.exe")) {
        Syelog(SYELOG_SEVERITY_INFORMATION, "Filtered in whitelist.\n");
    } else {
        std::tr2::sys::wpath src = std::tr2::sys::wpath(file_path);
        if (!std::tr2::sys::exists(src)) {
            Syelog(SYELOG_SEVERITY_WARNING, "File doesn't exist, path = %ls\n", file_path.c_str());
            return FALSE;
        }

        std::tr2::sys::wpath backup_path = std::tr2::sys::wpath(dest) / std::tr2::sys::wpath(L"backup");
        if (!std::tr2::sys::exists(backup_path)) {
            if (!std::tr2::sys::create_directories(backup_path)) {
                Syelog(SYELOG_SEVERITY_WARNING, "Cannot create directory, path = %ls\n", backup_path.string().c_str());
                return FALSE;
            }
        }

        std::tr2::sys::wpath saveto = (backup_path /= src.filename());
        Syelog(SYELOG_SEVERITY_DEBUG, "Copy File, from %ls to %ls\n", src.string().c_str(), saveto.string().c_str());
        std::tr2::sys::copy_file(src, saveto);
    }
    return TRUE;
}

BOOL BackupFileA(LPCSTR lpApplicationName,
                 LPSTR lpCommandLine)
{
    return BackupFileW(tmsa::Encoding::MBToWC(lpApplicationName).c_str(),
        (LPWSTR)tmsa::Encoding::MBToWC(lpCommandLine).c_str());
}

BOOL BackupFileW(LPCWSTR lpApplicationName,
                 LPWSTR lpCommandLine)
{
    if (lpApplicationName == NULL) {
        OutputDebugString(L"ApplicationName: NULL\n");
    } else {
        OutputDebugString(L"ApplicationName: ");
        OutputDebugString(lpApplicationName);
        OutputDebugString(L"\n");
    }

    if (lpCommandLine == NULL) {
        OutputDebugString(L"CommandLine: NULL\n");
    } else {
        OutputDebugString(L"CommandLine: ");
        OutputDebugString(lpCommandLine);
        OutputDebugString(L"\n");
    }

    if (BackupFileInternal(lpApplicationName)) {
        OutputDebugString(L"Backup file from application name successfully\n");
    }

    if (BackupFileInternal(lpCommandLine)) {
        OutputDebugString(L"Backup file from command line successfully\n");
    }
    
    return TRUE;
}

BOOL BackupContent(const char* content, unsigned long size, const char* name)
{
    std::tr2::sys::path dest = std::tr2::sys::path("backup");
    if (!std::tr2::sys::exists(dest)) {
        if (!std::tr2::sys::create_directories(dest)) {
            Syelog(SYELOG_SEVERITY_WARNING, "Cannot create directory, path = %s\n", dest.string().c_str());
            return FALSE;
        }
    }
    std::tr2::sys::path saveto = (dest /= name);
    std::ofstream ofs(saveto.string());
    ofs.write(content, size);
    ofs.close();
    return TRUE;
}

//-----------------------------------------------
// InjectDll
// Notice: Loads "*.dll" into the remote process
//		   (via CreateRemoteThread & LoadLibrary)
//
//		Return value:	1 - success;
//						0 - failure;
//
int InjectDll(const std::string& dllPath, HANDLE hProcess )
{
    char szImageName[MAX_PATH] = "\0";
    GetProcessImageFileNameA(hProcess, szImageName, MAX_PATH);
    Syelog(SYELOG_SEVERITY_INFORMATION, "Injected Image Name: %s\n", szImageName);
    std::string image_name(szImageName);
    //if (std::wstring::npos != image_name.find("cmd.exe")) {
    //    Syelog(SYELOG_SEVERITY_INFORMATION, "Don't inject into cmd.exe\n");
    //    return 1;
    //} 

    HANDLE hThread;
    char   szLibPath [_MAX_PATH];
    void*  pLibRemote = 0;	// the address (in the remote process) where
    // szLibPath will be copied to;
    DWORD  hLibModule = 0;	// base adress of loaded module (==HMODULE);

    HMODULE hKernel32 = ::LoadLibrary(L"Kernel32");

    // Get full path of "*.dll"
    strcpy_s(szLibPath, dllPath.c_str());

    // 1. Allocate memory in the remote process for szLibPath
    // 2. Write szLibPath to the allocated memory
    pLibRemote = ::VirtualAllocEx( hProcess, NULL, sizeof(szLibPath), MEM_COMMIT, PAGE_READWRITE );
    if( pLibRemote == NULL )
        return 0;
    ::WriteProcessMemory(hProcess, pLibRemote, (void*)szLibPath,sizeof(szLibPath),NULL);


    // Load "*.dll" into the remote process 
    // (via CreateRemoteThread & LoadLibrary)
    hThread = ::CreateRemoteThread( hProcess, NULL, 0,	
        (LPTHREAD_START_ROUTINE) ::GetProcAddress(hKernel32, "LoadLibraryA"), 
        pLibRemote, 0, NULL );
    if( hThread == NULL )
        goto JUMP;
    //std::cout << "Remote Thread ID: " << ::GetThreadId(hThread) << std::endl;

    ::WaitForSingleObject( hThread, INFINITE );

    // Get handle of loaded module
    ::GetExitCodeThread( hThread, &hLibModule );
    ::CloseHandle( hThread );

JUMP:	
    ::VirtualFreeEx( hProcess, pLibRemote, sizeof(szLibPath), MEM_RELEASE );
    if( hLibModule == NULL ) {
        char buf[64] = "\0";
        sprintf_s(buf, "Inject Failed!!! Error Code: %d\n", GetLastError());
        OutputDebugStringA(buf);
        return 0;
    }

    OutputDebugString(L"Inject Successfully!!!\n");
    return hLibModule;
}