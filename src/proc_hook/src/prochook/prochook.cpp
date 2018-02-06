#include <stdio.h>
#include <windows.h>
#include "detours.h"
#include "prochook_logger.h"
#include "syelog.h"
#include <string>
#include <fstream>
#include <exception>
#include "Psapi.h"

using namespace std;

#define WRITETOFILE( K, V) \
{ \
	wofstream f; f.open( L"c:\\temp\\prohook.temp.log", std::ofstream::out);\
	f << #K << "=" << V.c_str() << endl;\
	f.close();\
}

#define APPENDTOFILE( K, V) \
{ \
	wofstream f; f.open(L"c:\\temp\\prohook.temp.log", std::ofstream::out | std::ofstream::app);\
	f << #K << "=" << V.c_str() << endl;\
	f.close();\
}

#define PS_DEFAULT(p, default) (p==NULL? default : p)

#if defined(WIN32) | defined(WIN64) | defined(_WIN32) | defined(_WIN64) 
#ifdef PROCHOOK_EXPORTS
#define PROCHOOK_API __declspec(dllexport)
#else
#define PROCHOOK_API __declspec(dllimport)
#endif
#else	/* Linux/Unix */
#define PROCHOOK_API
#endif

#ifdef __cplusplus
extern "C" {
#endif
    PROCHOOK_API BOOL Test() {
        return TRUE;
    }
#ifdef __cplusplus
};
#endif

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
HMODULE (__stdcall * Real_LoadLibraryExW)(LPCWSTR a0,
                                          HANDLE a1,
                                          DWORD a2)
                                          = LoadLibraryExW;


PDETOUR_CREATE_PROCESS_INTERNAL_ROUTINEA Real_CreateProcessInternalA = NULL;
PDETOUR_CREATE_PROCESS_INTERNAL_ROUTINEW Real_CreateProcessInternalW = NULL;

//

BOOL __stdcall Mine_CreateProcessA(LPCSTR lpApplicationName,
                                   LPSTR lpCommandLine,
                                   LPSECURITY_ATTRIBUTES lpProcessAttributes,
                                   LPSECURITY_ATTRIBUTES lpThreadAttributes,
                                   BOOL bInheritHandles,
                                   DWORD dwCreationFlags,
                                   LPVOID lpEnvironment,
                                   LPCSTR lpCurrentDirectory,
                                   LPSTARTUPINFO lpStartupInfo,
                                   LPPROCESS_INFORMATION lpProcessInformation)
{
    Syelog(SYELOG_SEVERITY_INFORMATION, "[CreateProcessA] Application Name: %hs\n", lpApplicationName);
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

inline bool thereis(const std::string& cmd, const std::string& words){
	return cmd.find(words) != cmd.npos;
}

inline bool thereis(const std::wstring& cmd, const std::wstring& words){
	return cmd.find(words) != cmd.npos;
}

const char const* GetCurrentModulePath(){
	static char path[1024] = "\0";
	if (path[0] == '\0')
	{
		HMODULE hm = NULL;

		if (!GetModuleHandleExA(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS | 
			GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
			(LPCSTR) &GetCurrentModulePath, 
			&hm))
		{
			int ret = GetLastError();
			Syelog(SYELOG_SEVERITY_INFORMATION, "GetModuleHandle returned %d\n", ret);
		}
		GetModuleFileNameA(hm, path, sizeof(path));
	}
	return path;
}
inline void onCreateProcessW(const wstring& lpApplicationName, const wstring& lpCommandLine, const wstring& lpCurrentDirectory)
{
	std::wstring appname = lpApplicationName;
	if (thereis(lpApplicationName, L"python27.exe")|| thereis(lpCommandLine, L"python27.exe"))
	{
		Syelog(SYELOG_SEVERITY_INFORMATION, "%s", "thereis python27.exe");
		return;
	}
	
	std::string module_dir_path = GetCurrentModulePath();
	module_dir_path = module_dir_path.substr(0, module_dir_path.find_last_of('\\'));
	WRITETOFILE(lpApplicationName, lpApplicationName);
	APPENDTOFILE(lpCommandLine, lpCommandLine);
	APPENDTOFILE(lpCurrentDirectory, lpCurrentDirectory);
	std::string py_path = module_dir_path + "\\py\\python27.exe";
	std::string hook_script_path = module_dir_path + "\\hook_createprocess.py";
	std::string cmd = py_path + " " + hook_script_path;
	Syelog(SYELOG_SEVERITY_INFORMATION, "%s",  cmd.c_str());
	int ret = system(cmd.c_str());
	if( 0 != ret){
		Syelog(SYELOG_SEVERITY_INFORMATION, "Fail to call CreateProcess_Hook.exe,Ret = %d\n", ret);
	}
}

inline void  onCreateProcessA(const string& lpApplicationName, const string& lpCommandLine, const string& lpCurrentDirectory)
{
	std::string appname = lpApplicationName;
	if (thereis(lpApplicationName, "python27.exe") || thereis(lpCommandLine, "python27.exe"))
	{
		Syelog(SYELOG_SEVERITY_INFORMATION, "%s", "thereis python27.exe");
		return;
	}

	std::string module_dir_path = GetCurrentModulePath();
	module_dir_path = module_dir_path.substr(0, module_dir_path.find_last_of('\\'));
	WRITETOFILE(lpApplicationName, lpApplicationName);
	APPENDTOFILE(lpCommandLine, lpCommandLine);
	APPENDTOFILE(lpCurrentDirectory, lpCurrentDirectory);
	std::string py_path = module_dir_path + "\\py\\python27.exe";
	std::string hook_script_path = module_dir_path + "\\hook_createprocess.py";
	std::string cmd = py_path + " " + hook_script_path;
	Syelog(SYELOG_SEVERITY_INFORMATION, "%s", cmd.c_str());
	int ret = system(cmd.c_str());
	if( 0 != ret){
		Syelog(SYELOG_SEVERITY_INFORMATION, "Fail to call CreateProcess_Hook.exe,Ret = %d\n", ret);
	}
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
	wstring cmd_line;
	{
		cmd_line = PS_DEFAULT(lpCommandLine, L"");
		cmd_line = cmd_line.substr(0, 60);
		Syelog(SYELOG_SEVERITY_INFORMATION, "[CreateProcessW] lpCommandline : %ls\n", cmd_line.c_str());	
		Syelog(SYELOG_SEVERITY_INFORMATION, "[CreateProcessW] Application Name: %ls\n", lpApplicationName);	

		onCreateProcessW(PS_DEFAULT(lpApplicationName,L""), PS_DEFAULT(lpCommandLine, L""), PS_DEFAULT(lpCurrentDirectory, L""));
		Syelog(SYELOG_SEVERITY_INFORMATION, "%s%ls\n", "[CreateProcessW] after onCreateProcessW", cmd_line.c_str());
	}
	if (thereis(PS_DEFAULT(lpApplicationName, L""), L"python27.exe") || thereis(PS_DEFAULT(lpCommandLine, L""), L"python27.exe"))
	{
		Syelog(SYELOG_SEVERITY_INFORMATION, "[Real_CreateProcessW] ==> : %ls\n", cmd_line.c_str());	
		BOOL ret = Real_CreateProcessW(lpApplicationName,
			lpCommandLine,
			lpProcessAttributes,
			lpThreadAttributes,
			bInheritHandles,
			dwCreationFlags,
			lpEnvironment,
			lpCurrentDirectory,
			lpStartupInfo,
			lpProcessInformation
			);
		Syelog(SYELOG_SEVERITY_INFORMATION, "[Real_CreateProcessW] <==: %ls\n", cmd_line.c_str());	
		return ret;
	}else{
		Syelog(SYELOG_SEVERITY_INFORMATION, "[DetourCreateProcessWithDllExW] ==> : %ls\n", cmd_line.c_str());
		BOOL ret =  DetourCreateProcessWithDllExW(lpApplicationName,
			lpCommandLine,
			lpProcessAttributes,
			lpThreadAttributes,
			bInheritHandles,
			dwCreationFlags,
			lpEnvironment,
			lpCurrentDirectory,
			lpStartupInfo,
			lpProcessInformation,
			GetCurrentModulePath(), // get module name at runtime
			(PDETOUR_CREATE_PROCESS_ROUTINEW)Real_CreateProcessW);
		Syelog(SYELOG_SEVERITY_INFORMATION, "[DetourCreateProcessWithDllExW] <== %ls\n", cmd_line.c_str());
		return ret;
	}
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
                                           LPSTARTUPINFO lpStartupInfo,
                                           LPPROCESS_INFORMATION lpProcessInformation,
                                           PHANDLE hNewToken)
{
	string cmd_line;
	{
		cmd_line = PS_DEFAULT(lpCommandLine, "");
		cmd_line = cmd_line.substr(0, 60);
	}
    Syelog(SYELOG_SEVERITY_INFORMATION, "[CreateProcessInternalA] Command Line: %hs\n", cmd_line.c_str());
	onCreateProcessA(PS_DEFAULT(lpApplicationName, ""), PS_DEFAULT(lpCommandLine, ""), PS_DEFAULT(lpCurrentDirectory,""));
	Syelog(SYELOG_SEVERITY_INFORMATION, "[CreateProcessInternalA] after oncreate processA Command Line: %hs\n", cmd_line.c_str());
	BOOL ret = Real_CreateProcessInternalA(
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
	Syelog(SYELOG_SEVERITY_INFORMATION, "[CreateProcessInternalA] after Real_CreateProcessInternalA processA Command Line: %hs\n", lpCommandLine);
	return ret;
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
	wstring cmd_line;
	{
		cmd_line = PS_DEFAULT(lpCommandLine, L"");
		cmd_line = cmd_line.substr(0, 60);
	}
    Syelog(SYELOG_SEVERITY_INFORMATION, "[CreateProcessInternalW] Command Line: %ls\n", cmd_line.c_str());
    return Real_CreateProcessInternalW(
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

byte* SearchMemory(byte* start, unsigned int size, byte* pattern, unsigned int ptnLen)
{
    byte* pos = NULL;
    for (byte* p = start; p <= start+size-ptnLen; ++p)
    {
        if (0 == memcmp(p,pattern,ptnLen)) {
            pos = p;
            return pos;
        } else {
            continue;
        }
    }
    return pos;
}

LONG64 CalcOffset(ULONG64 curAddr, ULONG64 targetAddr)
{
    LONG64 offset = 0;
    if (abs((long long)(targetAddr - curAddr)) <= 5) {
        return offset;
    }

    //from low addr jump to hight addr
    //offset = high_addr - low_addr - 5
    //from high addr jump to low addr
    //offset = low_addr - high_addr -5
    return offset = targetAddr - curAddr - 5;
}

bool WriteOffset2Mem(LONG64 offset, char* buf, unsigned int size)
{
    try {
        long long tmpOffset = offset;
        for (unsigned int i = 0; i < size; ++i) {
            buf[i] = (char)tmpOffset;
            tmpOffset >>= 8;
        }
        return true;
    } catch (std::exception& e) {
        Syelog(SYELOG_SEVERITY_ERROR, e.what());
        return false;
    }
}

void Mine_AnalyzeEmbeddedInternal(DWORD* dwESP)
{
    try {
        // poi(ESP+4): address of embedded content
        // poi(ESP+8): length of embedded content
        char* addrEmbedded = (char*)(*(DWORD*)(dwESP+1));
        unsigned int sizeEmbedded = (unsigned int)(*(DWORD*)(dwESP+2));
        Syelog(SYELOG_SEVERITY_INFORMATION, "address: %p, length: %x\n", addrEmbedded, sizeEmbedded);
        if (memcmp(addrEmbedded, "FWS", 3) == 0 ||
            memcmp(addrEmbedded, "CWS", 3) == 0 ||
            memcmp(addrEmbedded, "ZWS", 3) == 0)
        {
            char flashSig[4] = {0};
            memcpy(flashSig, addrEmbedded, 3);
            Syelog(SYELOG_SEVERITY_INFORMATION, "Find embedded flash, magic header: %s\n", flashSig);
            char output[MAX_PATH] = {0};
            sprintf(output, "C:\\embedded_%s_0x%p_0x%x.bin", flashSig, addrEmbedded, sizeEmbedded);
            Syelog(SYELOG_SEVERITY_INFORMATION, "Dump embedded flash to: %s\n", output);
            std::ofstream ofs(output, std::ios::binary);
            ofs.write(addrEmbedded, sizeEmbedded);
            ofs.close();
        }
    } catch (std::exception& e) {
        Syelog(SYELOG_SEVERITY_ERROR, "Exception: %s\n", e.what());
    }
}

byte* g_addrAnalyzeEmbedded = NULL;

#pragma optimize( "", off )
void Mine_AnalyzeEmbedded()
{
    __asm {
        // save all registers
        PUSHAD;
    }
    DWORD* addrESP = NULL;
    __asm {
//200014a0 55              push    ebp
//200014a1 8bec            mov     ebp,esp
//200014a3 51              push    ecx
//200014a4 53              push    ebx
//200014a5 56              push    esi
//200014a6 57              push    edi
//200014a7 60              pushad
        
        // calculate ESP when enter into the hooked function
        LEA EAX, [EBP];
        ADD EAX, 4;
        MOV [addrESP], EAX;
    }

    Mine_AnalyzeEmbeddedInternal(addrESP);

    __asm {
        // restore all registers
        POPAD;

        // stack balance
        POP EDI;
        POP ESI;
        POP EBX;

        // epilog
        ADD ESP, 4h;
        POP EBP;

        // real instructions
        PUSH EBP;
        LEA EBP, [ESP-6Ch];

        JMP DWORD PTR[g_addrAnalyzeEmbedded]
    }
}
#pragma optimize( "", on )

HMODULE __stdcall Mine_LoadLibraryExW(LPCWSTR a0,
                                      HANDLE a1,
                                      DWORD a2)
{
    Syelog(SYELOG_SEVERITY_INFORMATION, "Enter into LoadLibraryExW, command line: (%ls,%p,%p)\n", a0, a1, a2);

    HMODULE rv = 0;
    MODULEINFO moduleInfo = {0};
    //__try {
        rv = Real_LoadLibraryExW(a0, a1, a2);
        if (a0 && wcsstr(a0,L"Flash32_")) {
            Syelog(SYELOG_SEVERITY_INFORMATION, "Find Flash Module");
            if (!GetModuleInformation(GetCurrentProcess(), rv, &moduleInfo, sizeof(MODULEINFO))) {
                Syelog(SYELOG_SEVERITY_INFORMATION, "Cannot get module info.");
            } else {
                Syelog(SYELOG_SEVERITY_INFORMATION, "base: %p, size: 0x%x, entry: %p\n", moduleInfo.lpBaseOfDll, moduleInfo.SizeOfImage, moduleInfo.EntryPoint);
                // how to rebase DLL?
                unsigned char pattern[] = {0x55,0x8D,0x6C,0x24,0x94,0x81,0xEC,0xFC,0x00,0x00,0x00,0x53,0x56,0x57,0x8B,0xF9};
                byte* pos = SearchMemory( (byte*)moduleInfo.lpBaseOfDll, moduleInfo.SizeOfImage, pattern, sizeof(pattern) );
                if (pos) {
                    Syelog(SYELOG_SEVERITY_INFORMATION, "Find pattern at 0x%p\n", pos);
                    // hook manually
                    DWORD oldProtect = 0;
                    if (!VirtualProtectEx(GetCurrentProcess(), pos, 5, PAGE_EXECUTE_READWRITE, &oldProtect)) {
                        Syelog(SYELOG_SEVERITY_ERROR, "Cannot modify the protection\n");
                        return rv;
                    }

                    memcpy(pos, "\xE9", 1);
                    WriteOffset2Mem((long long)CalcOffset((DWORD)pos, (DWORD)Mine_AnalyzeEmbedded), (char*)pos+1, 4);
                    g_addrAnalyzeEmbedded = pos+5;

                    //__asm {
                    //    INT 3;
                    //}

                } else {
                    Syelog(SYELOG_SEVERITY_WARNING, "Cannot find pattern\n");
                }
            }
        }
    //} __finally {
    //    Syelog(SYELOG_SEVERITY_INFORMATION, "Leave LoadLibraryExW(,,) -> %p\n", rv);
    //};
    return rv;
}

BOOL WINAPI DllMain(HINSTANCE hinst, DWORD dwReason, LPVOID reserved)
{
    LONG error;
    (void)hinst;
    (void)reserved;

    if (DetourIsHelperProcess()) {
        return TRUE;
    }

    if (dwReason == DLL_PROCESS_ATTACH) {
        // get undocumented API
        HINSTANCE hinstLib = LoadLibrary("kernel32.dll");
        if (NULL == hinstLib) {
            Syelog(SYELOG_SEVERITY_FATAL, "### Error loading kernel32.dll\n");
            return FALSE;
        }
        Real_CreateProcessInternalW = (PDETOUR_CREATE_PROCESS_INTERNAL_ROUTINEW)GetProcAddress(hinstLib, "CreateProcessInternalW");
        if (NULL == Real_CreateProcessInternalW) {
            Syelog(SYELOG_SEVERITY_FATAL, "### Error getting function address, CreateProcessInternalW\n");
            return FALSE;
        }
        Real_CreateProcessInternalA = (PDETOUR_CREATE_PROCESS_INTERNAL_ROUTINEA)GetProcAddress(hinstLib, "CreateProcessInternalA");
        if (NULL == Real_CreateProcessInternalA) {
            Syelog(SYELOG_SEVERITY_FATAL, "### Error getting function address, CreateProcessInternalA\n");
            return FALSE;
        }

        DetourRestoreAfterWith();
        OutputDebugString("PROCHOOK" DETOURS_STRINGIFY(DETOURS_BITS) ".dll:"
            " DllMain DLL_PROCESS_ATTACH\n");

        DetourTransactionBegin();
        DetourUpdateThread(GetCurrentThread());
        DetourAttach(&(PVOID&)Real_CreateProcessA, Mine_CreateProcessA);
        DetourAttach(&(PVOID&)Real_CreateProcessW, Mine_CreateProcessW);
        DetourAttach(&(PVOID&)Real_CreateProcessInternalA, Mine_CreateProcessInternalA);
        DetourAttach(&(PVOID&)Real_CreateProcessInternalW, Mine_CreateProcessInternalW);
        //DetourAttach(&(PVOID&)Real_LoadLibraryExW, Mine_LoadLibraryExW);
        error = DetourTransactionCommit();

        if (error == NO_ERROR) {
            OutputDebugString("PROCHOOK" DETOURS_STRINGIFY(DETOURS_BITS) ".dll:"
                " Detoured Successfully.\n");
        }
        else {
            Syelog(SYELOG_SEVERITY_FATAL, "### Error attaching detours: %d\n", error);
        }
    }
    else if (dwReason == DLL_PROCESS_DETACH) {
        DetourTransactionBegin();
        DetourUpdateThread(GetCurrentThread());
        DetourDetach(&(PVOID&)Real_CreateProcessA, Mine_CreateProcessA);
        DetourDetach(&(PVOID&)Real_CreateProcessW, Mine_CreateProcessW);
        DetourDetach(&(PVOID&)Real_CreateProcessInternalA, Mine_CreateProcessInternalA);
        DetourDetach(&(PVOID&)Real_CreateProcessInternalW, Mine_CreateProcessInternalW);
        error = DetourTransactionCommit();
;
        OutputDebugString("PROCHOOK" DETOURS_STRINGIFY(DETOURS_BITS) ".dll:"
            " Removed Detours.\n");
        fflush(stdout);
    }
    return TRUE;
}