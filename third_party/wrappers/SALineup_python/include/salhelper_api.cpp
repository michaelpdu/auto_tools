#include <iostream>
#include <cstring>
#include <boost/filesystem.hpp>

#include "src/utility/Encryptor.h"
#include "src/utility/EncodingUtility.h"
#include "src/utility/PatternPacker.h"
#include "salhelper_api.h"


extern "C" SAL_HELPER_API void SALHelper_Pack(const char* pack_in_path, const char* pack_out_path)
{
    boost::filesystem::path bfs_pack_out_path(pack_out_path);
    if (boost::filesystem::is_directory(bfs_pack_out_path)) {
        std::wcout << "Pack Error, Out Param is a director" << std::endl;
        return;
    }
    if (tmsa::PatternPacker::GetInstance()->Pack(pack_in_path, pack_out_path)) {
        std::wcout << "Pack Succ, Pack Out File=[" << tmsa::Encoding::fastMBToWC(pack_out_path) << std::endl;
    } else {
        std::wcout << "Pack Error" <<std::endl;
    }
}

extern "C" SAL_HELPER_API void SALHelper_Unpack(const char* pattern_file, const char* pattern_out_dir)
{
    if (!tmsa::PatternPacker::GetInstance()->Load(pattern_file)) {
        std::wcout << (L"load pattern error\n");
        return;
    }
    tmsa::PatternPacker::GetInstance()->DumpOutFiles(pattern_out_dir);
    std::wcout << (L"unpack pattern succ\n");
}

extern "C" SAL_HELPER_API void SALHelper_EncryptAndDecryptPattern(const char* option, const wchar_t* sourceFile, const wchar_t* destFile)
{
    tmsa::Encryptor encryptor;
    if (strcmp(option, "e") == 0) {
        encryptor.encryptAndZipFile(sourceFile, destFile, true);
    } else if (strcmp(option, "d") == 0) {
        encryptor.decryptAndUnzipFile(sourceFile, destFile);
    }
}