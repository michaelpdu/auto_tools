#ifndef __LOGGER_H__
#define __LOGGER_H__

#include <windows.h>

VOID SyelogOpen(PCSTR pszIdentifier, BYTE nFacility);
VOID SyelogExV(BOOL fTerminate, BYTE nSeverity, PCSTR pszMsgf, va_list args);
VOID SyelogV(BYTE nSeverity, PCSTR pszMsgf, va_list args);
VOID Syelog(BYTE nSeverity, PCSTR pszMsgf, ...);
VOID SyelogEx(BOOL fTerminate, BYTE nSeverity, PCSTR pszMsgf, ...);
VOID SyelogClose(BOOL fTerminate);

VOID _PrintEnter(const CHAR *psz, ...);
VOID _PrintExit(const CHAR *psz, ...);
VOID _Print(const CHAR *psz, ...);
VOID _VPrint(PCSTR msg, va_list args, PCHAR pszBuf, LONG cbBuf);
VOID AssertMessage(CONST PCHAR pszMsg, CONST PCHAR pszFile, ULONG nLine);

#endif //__LOGGER_H__