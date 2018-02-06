/***********************************************************************************
 * Copyright (C) 2007, Trend Micro Incorporated. All Rights Reserved.
 * This program is an unpublished copyrighted work which is proprietary to
 * Trend Micro Incorporated and contains confidential information that is
 * not to be reproduced or disclosed to any other person or entity without
 * prior written consent from Trend Micro, Inc. in each and every instance.
 * WARNING: Unauthorized reproduction of this program as well as unauthorized 
 * preparation of derivative works based upon the program or distribution of 
 * copies by sale, rental, lease or lending are violations of federal copyright
 * laws and state trade secret laws, punishable by civil and criminal penalties.
 ***********************************************************************************
 * 
 * @file     cstypes.h
 * 
 * @brief    common header file used in CS projects
 *
 * @author   Aries Hsieh
 * 
 * @date     2007/01/04
 * 
 * @version  1.0
 * 
 * @encoding US-ASCII
 * 
 * @change history 2007/01/24 1. change INT32_SIZE from 10 to 11
 *                            2. change INT64_SIZE from 20 to 21
 *                 2007/07/05 1. change INT32_SIZE from 11 to 12 (max: -2147483648)
 *                            2. change INT64_SIZE from 21 to 22
 *                 2007/08/14 1. change MAX_HOST_NAME_SIZE from 128 to 256
 *                 2007/11/08 1. support Solaris
 *                 2008/03/05 1. change bool size to char, not uint
 *                 2008/04/17 1. Add Byte order define and media to host and host to media helper functions.
 *                 2008/04/18 1. includes crtdefs.h for size_t in win32 platform
 *                 2008/05/07 1. support size_t and inline on Solaris.
 *                 2008/06/13 1. Add _countof macro
 **********************************************************************************/
#ifndef _CSTYPES_H_
#define _CSTYPES_H_

/* function return values */
#define SUCCESS                     (0)
#define FAILURE                     (-1)

/* count number of elements */
#ifndef _countof
#define _countof(_Array) (sizeof(_Array) / sizeof((_Array)[0]))
#endif


/* define predict flow */
#if !defined likely
#	if __GNUC__ >= 3
#		define likely(x)            __builtin_expect (!!(x), 1)
#	else
#		define likely(x)            (x)
#	endif
#endif

#if !defined unlikely
#	if __GNUC__ >= 3
#		define unlikely(x)          __builtin_expect (!!(x), 0)
#	else
#		define unlikely(x)          (x)
#	endif
#endif

/* avoid warning about unused parameter */
#if !defined UNUSED
#	if defined(__GNUC__)
#		define UNUSED(x)            x __attribute__((unused))
#	else
#		define UNUSED(x)            x
#	endif
#endif

/* Boolean type, true/false values */
#ifndef __cplusplus
    #define bool                    unsigned char 
    #ifndef true
        #define true                (0x01)
    #endif
    #ifndef false
        #define false               (0x00)
    #endif
#endif  /* __cplusplus */

#ifndef TRUE
    #define TRUE                    (true)
#endif

#ifndef FALSE
    #define FALSE                   (false)
#endif

/* _SIZE could be used to declare array buffer and should include the 
   last NULL character */
/* _LEN could be used in condition, and does not include the NULL */

/* maximum path length (including directory and filename) */
#define MAX_PATH_SIZE               (1024)
//#define MAX_PATH_LEN                (MAX_PATH_SIZE-1)

/* maximum filename length (do not include directory part) */
#define MAX_FILE_NAME_SIZE          (256)
//#define MAX_FILE_NAME_LEN           (MAX_FILE_LEN-1)

/* maximum int32 and int64 string length */
#define INT32_SIZE                  (12)
#define INT32_LEN                   (INT32_SIZE-1)
#define INT64_SIZE                  (22)
#define INT64_LEN                   (INT64_SIZE-1)

/* maximum hostname, IP address, and URL length */
#define MAX_URL_SIZE                (4096)
#define MAX_URL_LEN                 (MAX_URL_SIZE-1)
#define MAX_IP_STR_SIZE             (17)
#define MAX_IP_STR_LEN              (MAX_IP_STR_SIZE-1)
#define MAX_HOST_NAME_SIZE          (256)
#define MAX_HOST_NAME_LEN           (MAX_HOST_NAME_SIZE-1)

/* directory separator */
#if defined (WIN32) || (_WIN64)
    #define DIR_SEP                 '\\'
    #define DIR_SEP_STR             "\\"
#else
    #define DIR_SEP                 '/'
    #define DIR_SEP_STR             "/"
#endif

/* stdin, stdout, and stdrrr file descriptors */
#define FD_STDIN                    (0)
#define FD_STDOUT                   (1)
#define FD_STDERR                   (2)

/* primitive type definitions */
#define float32                     float
#define float64                     double

/* windows platform */
#if defined (WIN32) || defined (_WIN64)

    #include <BaseTsd.h>
    #include <crtdefs.h>

    /* signed */
    typedef __int64 int64;
    #define int32   long
    #define int16   short
    #define int8    char

    /* unsigned */
    typedef unsigned __int64 uint64;
    #define uint32  unsigned long
    #define uint16  unsigned short
    #define uint8   unsigned char
    #define uchar   unsigned char

    /* pointer */
    #ifdef WIN32
        #define pint    int32
        #define puint   uint32
    #else
        #define pint    int64
        #define puint   uint64
    #endif

    /* ssize_t */
    typedef SSIZE_T     ssize_t;

/* linux platform */
#elif defined (LINUX) || defined (__linux__)

    #include <sys/types.h>
    #include <inttypes.h>

    /* signed */
    #define int64   int64_t
    #define int32   int32_t
    #define int16   int16_t
    #define int8    int8_t

    /* unsigned */
    #define uint64  uint64_t
    #define uint32  uint32_t
    #define uint16  uint16_t
    #define uint8   uint8_t
    #define uchar   unsigned char

    /* pointer */
    #define pint    intptr_t
    #define puint   uintptr_t

/* sparc 32-bit platform */
#elif defined (__sparc) || defined (__sun)

    #include <sys/types.h>
    #include <inttypes.h>

    /* signed */
    #define int64   int64_t
    #define int32   int32_t
    #define int16   int16_t
    #define int8    int8_t

    /* unsigned */
    #define uint64  uint64_t
    #define uint32  uint32_t
    #define uint16  uint16_t
    #define uint8   uint8_t
    #define uchar   unsigned char

    /* pointer */
    #define pint    intptr_t
    #define puint   uintptr_t

    #define CS_BIGENDIAN

#endif  /* primitive types for different platforms */

/* function names */
#if defined (WIN32) || defined (_WIN64)
    #define itoa        _itoa
    #define strcasecmp  _stricmp
    #define strncasecmp _strnicmp
    #define snprintf    _snprintf
    #define getpid      _getpid
    #define bzero       ZeroMemory
    #define __func__    __FUNCTION__    /* only available on VS.NET 2003 and later */
#endif

/* Type definition for TMUFE specified error code */
typedef ssize_t         ERRORCODE;

/* Macros to examine the error code */
#define IS_SUCCESS(code)            (likely((code) == SUCCESS) ? TRUE : FALSE)
#define IS_FAILURE(code)            (unlikely((code) <= FAILURE) ? TRUE : FALSE)

#if defined (WIN32) || defined (_WIN64) 
    #define __FUNCNAME__ __FUNCDNAME__
#elif defined (LINUX) || defined (__linux__)
    #ifdef __GNUC__
        #define __FUNCNAME__ __PRETTY_FUNCTION__
    #else
        #define __FUNCNAME__ __FUNCTION__
    #endif
#else
    #define __FUNCNAME__ __FUNCTION__
#endif

/* Format string */
#if defined (WIN32) || defined (_WIN64) 
    #define FMT_SIZET "I"
#elif defined (LINUX) || defined (__linux__)
    #define FMT_SIZET "z"
#else
    #define FMT_SIZET "l"
#endif

/* Byte order and media to host and host to media helper functions. */
#define CS_BSWAP_INT16(n)          ((((n) >> 8) & 0xff) \
                                  | (((n) & 0xff) << 8) )
#define CS_BSWAP_INT32(n)          ((((n) & 0xff000000) >> 24) \
                                  | (((n) & 0x00ff0000) >>  8) \
                                  | (((n) & 0x0000ff00) <<  8) \
                                  | (((n) & 0x000000ff) << 24))
#define CS_BSWAP_INT64(n)          ((((n) & 0xff00000000000000ull) >> 56)  \
                                  | (((n) & 0x00ff000000000000ull) >> 40)  \
                                  | (((n) & 0x0000ff0000000000ull) >> 24)  \
                                  | (((n) & 0x000000ff00000000ull) >> 8)   \
                                  | (((n) & 0x00000000ff000000ull) << 8)   \
                                  | (((n) & 0x0000000000ff0000ull) << 24)  \
                                  | (((n) & 0x000000000000ff00ull) << 40)  \
                                  | (((n) & 0x00000000000000ffull) << 56))

#if defined(CS_BIGENDIAN)
    #define H2M_INT16(n)           CS_BSWAP_INT16 (n)
    #define H2M_INT32(n)           CS_BSWAP_INT32 (n)
    #define H2M_INT64(n)           CS_BSWAP_INT64 (n)
    #define M2H_INT16(n)           CS_BSWAP_INT16 (n)
    #define M2H_INT32(n)           CS_BSWAP_INT32 (n)
    #define M2H_INT64(n)           CS_BSWAP_INT64 (n)
#else
    #define H2M_INT16(n)           (n)
    #define H2M_INT32(n)           (n)
    #define H2M_INT64(n)           (n)
    #define M2H_INT16(n)           (n)
    #define M2H_INT32(n)           (n)
    #define M2H_INT64(n)           (n)
#endif

/* others */
#ifndef __WORDSIZE
    #if defined (__X86_64__) || defined (_WIN64) || defined (_LP64)
        #define __WORDSIZE 64
    #else
        #define __WORDSIZE 32
    #endif 
#endif  /* __WORDSIZE */

#ifndef CS_INLINE
    #ifdef __cplusplus
        #define CS_INLINE inline
    #else
		#if defined (__sparc) || defined (__sun)
            #define CS_INLINE
		#else
            #define CS_INLINE __inline
        #endif
    #endif
#endif  /* CS_INLINE */

#endif  /* _CSTYPES_H_ */
