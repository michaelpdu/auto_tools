#ifndef __TRACE_WIN32_H__
#define __TRACE_WIN32_H__

#include <windows.h>

LONG AttachDetours(VOID);
LONG DetachDetours(VOID);

#endif //__TRACE_WIN32_H__