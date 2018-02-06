#include "prochook_logger.h"
#include <stdio.h>

VOID SyelogOpen(PCSTR pszIdentifier, BYTE nFacility)
{
    (void)pszIdentifier;
    (void)nFacility;
}

VOID SyelogExV(BOOL fTerminate, BYTE nSeverity, PCSTR pszMsgf, va_list args)
{
    (void)fTerminate;

    CHAR szBuffer[1024];
    PCHAR psz = szBuffer;
    BOOL fLf = FALSE;

    sprintf_s(psz, szBuffer + sizeof(szBuffer) - psz, "--.%02x: ", nSeverity);
    while (*psz) {
        psz++;
    }

    vsprintf_s(psz, szBuffer + sizeof(szBuffer) - psz, pszMsgf, args);
    for (psz = szBuffer; *psz; psz++) {
        if (*psz == '\n') {
            if (fLf) {
                *psz = '\0';
                break;
            }
            fLf = TRUE;
        }
    }
    if (!fLf) {
        *psz++ = '\n';
        *psz = '\0';
    }
    printf("%s", szBuffer);
    OutputDebugStringA(szBuffer);
}

VOID SyelogV(BYTE nSeverity, PCSTR pszMsgf, va_list args)
{
    SyelogExV(FALSE, nSeverity, pszMsgf, args);
}

VOID Syelog(BYTE nSeverity, PCSTR pszMsgf, ...)
{
    va_list args;
    va_start(args, pszMsgf);
    SyelogExV(FALSE, nSeverity, pszMsgf, args);
    va_end(args);
}

VOID SyelogEx(BOOL fTerminate, BYTE nSeverity, PCSTR pszMsgf, ...)
{
    va_list args;
    va_start(args, pszMsgf);
    SyelogExV(fTerminate, nSeverity, pszMsgf, args);
    va_end(args);
}

