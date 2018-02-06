#include <iostream>
#include <sstream>
#include <windows.h>
#include <filesystem>
#include <stdlib.h>

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
    HANDLE hThread;
    char   szLibPath [_MAX_PATH];
    void*  pLibRemote = 0;	// the address (in the remote process) where
    // szLibPath will be copied to;
    DWORD  hLibModule = 0;	// base adress of loaded module (==HMODULE);

    HMODULE hKernel32 = ::GetModuleHandle("Kernel32");


    // Get full path of "*.dll"
    strcpy_s(szLibPath, dllPath.c_str());


    // 1. Allocate memory in the remote process for szLibPath
    // 2. Write szLibPath to the allocated memory
    pLibRemote = ::VirtualAllocEx( hProcess, NULL, sizeof(szLibPath), MEM_COMMIT, PAGE_READWRITE );
    if( pLibRemote == NULL )
        return false;
    ::WriteProcessMemory(hProcess, pLibRemote, (void*)szLibPath,sizeof(szLibPath),NULL);


    // Load "*.dll" into the remote process 
    // (via CreateRemoteThread & LoadLibrary)
    hThread = ::CreateRemoteThread( hProcess, NULL, 0,	
        (LPTHREAD_START_ROUTINE) ::GetProcAddress(hKernel32,"LoadLibraryA"), 
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
        std::cout << "Inject Failed!!! Last Error: " << GetLastError() << std::endl;
        return false;
    }


    //// Unload "*.dll" from the remote process 
    //// (via CreateRemoteThread & FreeLibrary)
    //hThread = ::CreateRemoteThread( hProcess,
    //    NULL, 0,
    //    (LPTHREAD_START_ROUTINE) ::GetProcAddress(hKernel32,"FreeLibrary"),
    //    (void*)hLibModule,
    //    0, NULL );
    //if( hThread == NULL )	// failed to unload
    //    return false;
    //::WaitForSingleObject( hThread, INFINITE );
    //::GetExitCodeThread( hThread, &hLibModule );
    //::CloseHandle( hThread );

    // return value of remote FreeLibrary (=nonzero on success)

    std::cout << "Inject Successfully!!!" << std::endl;
    return hLibModule;
}

void PrintUsage()
{
    std::stringstream msg;
    msg << "Usage:"
        << "  injectdll.exe abc.dll proc_id"
        << std::endl;
    std::cout << msg.str() << std::endl;
}

void EnableDebugPriv()
{
    HANDLE hToken;
    LUID luid;
    TOKEN_PRIVILEGES tkp;

    OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &hToken);

    LookupPrivilegeValue(NULL, SE_DEBUG_NAME, &luid);

    tkp.PrivilegeCount = 1;
    tkp.Privileges[0].Luid = luid;
    tkp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

    AdjustTokenPrivileges(hToken, false, &tkp, sizeof(tkp), NULL, NULL);

    CloseHandle(hToken); 
}


int main(int argc, char** argv)
{
    if (argc != 3) {
        PrintUsage();
        return false;
    }
    
    EnableDebugPriv();

    using namespace std::tr2::sys;
    path arg1(argv[1]);
    if (!exists(arg1)) {
        std::cerr << "Cannot find " << arg1.string() << std::endl;
        return false;
    }
    path dllPath =  system_complete(arg1);

    char* pszProcID = argv[2];
    HANDLE hProc = OpenProcess(PROCESS_ALL_ACCESS, FALSE, std::stoi(pszProcID));
    if (NULL == hProc) {
        std::cerr << "Cannot find process ID: " << pszProcID << std::endl;
        return false;
    }

    if (!InjectDll(dllPath.string(), hProc)) {
        std::cerr << "Inject DLL failed." << std::endl;
        CloseHandle(hProc);
        return false;
    }

    CloseHandle(hProc);

    return true;
}

