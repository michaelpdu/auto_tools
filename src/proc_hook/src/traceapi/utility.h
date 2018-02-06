#ifndef __UTILITY_H__
#define __UTILITY_H__

#include <windows.h>
#include <string>

PIMAGE_NT_HEADERS NtHeadersForInstance(HINSTANCE hInst);
BOOL ProcessEnumerate();
BOOL InstanceEnumerate(HINSTANCE hInst);

BOOL BackupFileA(LPCSTR lpApplicationName,
                 LPSTR lpCommandLine);
BOOL BackupFileW(LPCWSTR lpApplicationName,
                 LPWSTR lpCommandLine);

BOOL BackupContent(const char* content, unsigned long size, const char* name = "unknown.exe");

int InjectDll(const std::string& dllPath, HANDLE hProcess );

#endif //__UTILITY_H__