#ifndef _SALHELPER_API_H_
#define _SALHELPER_API_H_
#endif 

#if defined(WIN32) | defined(WIN64) | defined(_WIN32) | defined(_WIN64) 
#ifdef SAL_HELPER_EXPORTS
#define SAL_HELPER_API __declspec(dllexport)
#else
#define SAL_HELPER_API __declspec(dllimport)
#endif
#endif

extern "C" SAL_HELPER_API void SALHelper_Pack(const char* pack_in_path, const char* pack_out_path);

extern "C" SAL_HELPER_API void SALHelper_Unpack(const char* pattern_file, const char* pattern_out_dir);

extern "C" SAL_HELPER_API void SALHelper_EncryptAndDecryptPattern(const char* option, const wchar_t* sourceFile, const wchar_t* destFile);