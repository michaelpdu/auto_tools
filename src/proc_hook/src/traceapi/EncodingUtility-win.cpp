#include "EncodingUtility.h"

#include <Windows.h> /* NOTE: windows.h must be placed at the front of cstypes.h */
#include "cstypes.h"

using namespace tmsa;

// These must be the same size and order as the enum EncodingType entries !!!
const wchar_t* EncodingStrings[] = {
	L"UTF-7",
	L"UTF-8",
	L"UTF-16LE",
	L"UTF-16BE",
	L"UTF-32",
	L"UTF-EBCDIC",
	L"ISO_8859_1",
	L"ISO_8859_2",
	L"ISO_8859_5",
	L"BIG5",
	L"GB2312",
	L"SHIFT_JIS",
	L"EUC_JP",
	L"EUC_KR",
	L"ANSI",
	L"OEM",
	L"US-ASCII",
	L"GBK",
	L"UTF-32BE",
	L"NONE"
};



namespace FROM_ENCODING_TYPE_TO_CODE_PAGE
{
	const int CodePages[] = {
		CP_UTF7, 		CP_UTF8,		CP_UTF8,		CP_UTF8,  
		CP_UTF8,       CP_UTF8,		28591,			28592,			
		28595,           950,			    936,			    932,		
		20932,           949,			    CP_ACP,			CP_OEMCP,		
		CP_UTF8,		936,		CP_UTF8
	};

	unsigned int ToCodePage(Encoding::EncodingType encoding)
	{
		if(encoding >= 0 && encoding < Encoding::ENCODING_COUNT -1 )
			return CodePages[encoding];
		else
			return CP_UTF8;
	}
}
using FROM_ENCODING_TYPE_TO_CODE_PAGE::ToCodePage;



long Encoding::MultiByteToWideChar(EncodingType& encoding, const char * from, long fromLength, wchar_t * to, long toLength)
{
	long decodedSize = 0;
    
	//clean previous error informantion
	::SetLastError(0);

	if (toLength == 0)
	{
		switch(encoding)
		{
		case UTF_16LE:
			return -1;  //no need to translate
		case UTF_32:
			return fromLength/4;
		case UTF_32BE:
			return fromLength/4;
		case UTF_16BE:
			return fromLength/2;
		case US_ASCII:
			return fromLength;
		default:
			decodedSize = ::MultiByteToWideChar(ToCodePage(encoding), 0, from, fromLength, to, 0);
			break;
		}
	}
	else
	{
		int convertedSize;
		switch(encoding)
		{
		case UTF_16LE:
			return -1;  //no need to translate
		case UTF_16BE:
		{
			memset(to,0,toLength * sizeof(wchar_t));
			convertedSize = (fromLength < 2 * toLength) ? fromLength / 2 :  toLength;
			char *  destination = (char *)to;
			for(long i = 0; i < convertedSize; i++)
			{
				destination[i * 2] = from[i * 2 + 1];
				destination[i * 2 + 1] = from[i * 2];
			}
			return convertedSize;
		}
		case US_ASCII:
		{
			//TODO , should first transfer to char, then call MultiByteToWideChar to multichar?
			memset(to,0,toLength * sizeof(wchar_t));
			convertedSize = (fromLength < toLength) ? fromLength :  toLength;
			char*  destination = (char *)to;
			for(long i = 0; i < convertedSize ; i++)
			{
				char ch = from[i];
				if ( ch & 0x80 ){
					ch &= 0x7f;
				}
				destination[i * 2] = ch;
				destination[i * 2 + 1 ] = 0;
			}
			 return convertedSize;
		}
		case UTF_32:
		{
			convertedSize = (fromLength < 4 * toLength) ? fromLength / 4 :  toLength;
			int32 * source = (int32 *)(from);
			wchar_t *  destination = (wchar_t *)to;
			for(long i = 0; i < convertedSize; i++)
			{
				*destination++ = ((wchar_t)(*source++));
			}
			return convertedSize;
		}
		case UTF_32BE:
		{
			memset(to, 0, toLength * sizeof(wchar_t));
			convertedSize = (fromLength < 4 * toLength) ? fromLength / 4 :  toLength;
			wchar_t * destination = (wchar_t *)to;
			for (long i = 3; i < convertedSize*4 ; i=i+4) {
				char ch = from[i];
				*destination++ = ((wchar_t)(ch));
			}
			return convertedSize;
		}
		default:
			decodedSize = ::MultiByteToWideChar(ToCodePage(encoding), 0, from, fromLength, to, toLength);
			break;
		}
	}

	if(decodedSize == 0 && GetLastError() == ERROR_INSUFFICIENT_BUFFER)	// Not fatal error, still successful
		return toLength;

	return decodedSize;
}

long Encoding::WideCharToMultiByte(EncodingType encoding, const wchar_t * from, long fromLength, char * to, long toLength)
{
	if (toLength == 0)
	{
		switch(encoding)
		{
		case UTF_16LE:
		case UTF_16BE:
			return -1;  //no need to translate
		case UTF_32:
			return fromLength*4;
		case UTF_32BE:
			return fromLength*4;
		default:
			return ::WideCharToMultiByte(ToCodePage(encoding), 0, from, fromLength, to, 0, NULL, NULL);
		}
	}
	else
	{
		int convertedSize;
		switch(encoding)
		{
		case UTF_16LE:
		case UTF_16BE:
			return -1;  //no need to translate
		case UTF_32:
		{
			int32 * destination = (int32 *)to;
			const wchar_t * source = from;
			convertedSize = (fromLength * 4 < toLength ) ? fromLength * 4 : toLength;
			for(long i = 0; i < convertedSize; i += 4)
			{
				*destination++ = ((int32)(*source++));
			}
			return convertedSize;
		}
		case UTF_32BE:
		{
			// TODO: if needed
		}
		default:
		   return ::WideCharToMultiByte(ToCodePage(encoding), 0, from, fromLength, to, toLength, NULL, NULL);
		}
	}
	return 0;
}

const wchar_t * Encoding::ToString(Encoding::EncodingType type)
{
	if(type >= 0 && type < ENCODING_COUNT)
		return EncodingStrings[type];
	else
		return EncodingStrings[ISO_8859_1];
}

Encoding::EncodingType Encoding::ToEncodingType(wchar_t* encoding)
{
	if ( NULL == encoding )
		return Encoding::ISO_8859_1;

	for(size_t iType = 0; iType < ENCODING_COUNT; iType ++) {
		if(wcscmp(EncodingStrings[iType], encoding) == 0)
			return (EncodingType)iType;
	}
	return Encoding::ISO_8859_1;
}

// string to wstring conversion using given codepage
wstring Encoding::MBToWC(const string& mbsstr, EncodingType encoding) {
	size_t requiredSize;
	requiredSize = MultiByteToWideChar(encoding, mbsstr.c_str(), mbsstr.length(), NULL, 0);
	if(requiredSize == 0)
		return L"";
	wchar_t* pszBuf = new wchar_t[requiredSize + 1];
	if (0 == pszBuf)
		return L"";
	int size = MultiByteToWideChar(encoding, mbsstr.c_str(), mbsstr.length(), pszBuf, requiredSize);
	if(size <= 0)
	{
		delete [] pszBuf;
		return L"";
	} 
	wstring wcsstr(pszBuf, size);
	delete [] pszBuf;
	return wcsstr;
}

// wstring to string conversion using given codepage
string Encoding::WCToMB(const wstring& wcsstr, EncodingType encoding) {
	size_t requiredSize;
	requiredSize = WideCharToMultiByte(encoding, wcsstr.c_str(), wcsstr.length(), NULL, 0);
	if(requiredSize == 0)
		return "";
	char* pszBuf = new char[requiredSize + 1];
	if (0 == pszBuf)
		return "";
	int size = WideCharToMultiByte(encoding, wcsstr.c_str(), wcsstr.length(), pszBuf, requiredSize);
	if(size <= 0)
	{
		delete [] pszBuf;
		return "";
	}

	string mbsstr(pszBuf, size);
	delete [] pszBuf;
	return mbsstr;
}

// Quick char-wchar convertion for internal use, support only ascii characters
wstring Encoding::fastMBToWC(const string& mbsstr) {
    string::size_type i;
    char* pszBuf = new (std::nothrow) char[mbsstr.length() * 2 + 2];
    if(pszBuf == NULL) {
        return L"";
    }
    for (i = 0; i < mbsstr.length(); i ++) {
        pszBuf[i * 2] = mbsstr[i];
        pszBuf[i * 2 + 1] = 0;
    }
    pszBuf[i * 2] = 0;
    pszBuf[i * 2 + 1] = 0;
    wstring wcsstr(reinterpret_cast<wchar_t *>(pszBuf));
    delete [] pszBuf;
    return wcsstr;

}

string Encoding::fastWCToMB(const wstring& wcsstr) {
	wstring::size_type i;
	char* pszBuf = new char[wcsstr.length() + 1];
	for (i = 0; i < wcsstr.length(); i ++) {
		if(wcsstr[i] <= L'\x7F')
			pszBuf[i] = static_cast<char>(wcsstr[i]);
		else	// not ascii char
			pszBuf[i] = '.';
	}
	pszBuf[i] = 0;
	string mbsstr(pszBuf, wcsstr.length());
	delete [] pszBuf;
	return mbsstr;
}

std::string Encoding::HexEncode( const char *pszContent, size_t length) {
    std::string result;
    const char *szHexMap = "0123456789abcdef";
    if ( pszContent != NULL ) {
        result.reserve( length * 2 );
        for ( size_t i = 0; i < length; ++ i ) {
            unsigned char code = static_cast<unsigned char>(pszContent[i]);
            result += szHexMap[((code >> 4) & 0x0f)];
            result += szHexMap[((code) & 0x0f)];
        }
    }
    return result;
}

std::string Encoding::HexChar(unsigned char c) {
    std::string result;
    const char *szHexMap = "0123456789abcdef";
    result += szHexMap[((c >> 4) & 0x0f)];
    result += szHexMap[((c) & 0x0f)];
    return result;
}

void Encoding::JSUnicodeStringEncode(const char *pContent, size_t length, std::string &rAppendTo) {
    if ( pContent && length >= 2 ) {
        rAppendTo.reserve( rAppendTo.size() + length * 3 + 2 );
        for ( size_t i = 0; i < length - 1; i += 2 ) {
            rAppendTo += "\\u";
            rAppendTo += HexChar( pContent[i + 1] );
            rAppendTo += HexChar( pContent[i] );
        }
    }
}

std::string Encoding::toANSI(std::string str)
{
    std::string retval;
    for(size_t i = 0; i < str.size(); i ++) {
        unsigned int val = (unsigned int)str[i];
        if (val == 0x0d || val == 0x0a || val == 0x09) {
            retval += val;
            continue;
        } else if(val >= 0x7f || (0 < val && val <= 0x1f)) {
            retval += "0x";
            retval += HexChar(val);
        } else {
            retval += val;
        }
    }
    return retval;
}

int Encoding::ContainInvalidCharacter(std::string str)
{
    int invalidCharacterNumber = 0;
    for(size_t i = 0; i < str.size(); i ++) {
        unsigned int val = (unsigned int)str[i];
        if (val == 0x0d || val == 0x0a || val == 0x09 ) {
            continue;
        } else if(val >= 0x7f || (0 < val && val <= 0x1f)) {
            ++invalidCharacterNumber;
        }
    }
    return invalidCharacterNumber;
}

std::string Encoding::FilterInvalidCharacter(std::string str)
{
    std::string retval;
    for(size_t i = 0; i < str.size(); i ++) {
        unsigned int val = (unsigned int)str[i];
        if (val == 0x0d || val == 0x0a || val == 0x09) {
            retval += val;
            continue;
        } else if(val >= 0x7f || (0 < val && val <= 0x1f)) {
           continue;
        } else {
            retval += val;
        }
    }
    return retval;
}

std::string Encoding::AnsiToUtf8(const std::string& ansiContent)
{
    if (ansiContent.empty()) return "";
    // convert ANSI to UNICODE
    int nLen = ::MultiByteToWideChar(CP_UTF8, 0, ansiContent.c_str(), -1, NULL, 0);
    wchar_t* pwszBuf = new wchar_t[nLen+1] ;
    ZeroMemory(pwszBuf, sizeof(wchar_t) * (nLen+1)) ;
    ::MultiByteToWideChar(CP_ACP, 0, ansiContent.c_str(), -1, pwszBuf, nLen);
    // convert UNICODE to UTF-8
    nLen = ::WideCharToMultiByte(CP_UTF8, 0, pwszBuf, -1, NULL, 0, 0, 0);
    char* pszBuf = new char[nLen+1];
    ZeroMemory(pszBuf, sizeof(char) * (nLen+1));
    ::WideCharToMultiByte(CP_UTF8, 0, pwszBuf, -1, pszBuf, nLen, 0, 0);
    // save return content
    std::string retVal;
    if (pszBuf) retVal = pszBuf;
    // release memory
    delete[] pwszBuf;
    delete[] pszBuf;
    return retVal ;
}
