#ifndef _TMSA_ENCODING_UTILITY_H_
#define _TMSA_ENCODING_UTILITY_H_

#include <vector>
#include <string>

using std::string;
using std::wstring;

namespace tmsa {

class Encoding
{
public:
	enum EncodingType {
        UTF_7,          UTF_8,          UTF_16LE,       UTF_16BE,
		UTF_32,         UTF_EBCDIC,     ISO_8859_1,     ISO_8859_2,
		ISO_8859_5,     BIG5,           GB2312,         SHIFT_JIS,
		EUC_JP,         EUC_KR,         ANSI,           OEM,
		US_ASCII,       GBK,			UTF_32BE,
		NONE,       ENCODING_COUNT
    };

	static long MultiByteToWideChar( EncodingType& encoding, 
									 const char * from, long fromLength, 
									 wchar_t * to,      long toLength);

    static long WideCharToMultiByte( EncodingType encoding, 
									 const wchar_t * from, long fromLength, 
									 char * to,            long toLength);

    static const wchar_t * ToString(Encoding::EncodingType type);
    static Encoding::EncodingType ToEncodingType(wchar_t * encoding);
	static wstring fastMBToWC(const string&);
	static string fastWCToMB(const wstring&);
	static wstring MBToWC(const string&, EncodingType encoding = ISO_8859_1);
	static string WCToMB( const wstring&, EncodingType encoding = ISO_8859_1);
	static std::string HexEncode( const char *pszContent, size_t length);
	static std::string HexChar(unsigned char c);
	static void JSUnicodeStringEncode(const char *pContent, size_t length, std::string &rAppendTo);
    static std::string toANSI(std::string str);
    static int ContainInvalidCharacter(std::string str);
    static std::string AnsiToUtf8(const std::string& ansiContent);
    static std::string FilterInvalidCharacter(std::string str);

};

} // namespace tmsa

#endif //_TMSA_ENCODING_UTILITY_H_
