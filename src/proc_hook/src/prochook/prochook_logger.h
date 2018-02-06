#ifndef __PROCHOOK_LOGGER_H__
#define __PROCHOOK_LOGGER_H__

#include <windows.h>

VOID SyelogOpen(PCSTR pszIdentifier, BYTE nFacility);
VOID SyelogExV(BOOL fTerminate, BYTE nSeverity, PCSTR pszMsgf, va_list args);
VOID SyelogV(BYTE nSeverity, PCSTR pszMsgf, va_list args);
VOID Syelog(BYTE nSeverity, PCSTR pszMsgf, ...);
VOID SyelogEx(BOOL fTerminate, BYTE nSeverity, PCSTR pszMsgf, ...);
VOID SyelogClose(BOOL fTerminate);

#endif
