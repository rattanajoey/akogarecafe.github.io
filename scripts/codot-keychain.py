"""Keep the dashboard-only capability in this Mac's login Keychain.

The monitoring process calls `get` internally; never run it in a tool that
prints stdout. `put` accepts the value on stdin, never in command arguments.
"""
import ctypes as c
import secrets
import sys

cf = c.CDLL('/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation')
sec = c.CDLL('/System/Library/Frameworks/Security.framework/Security')
ptr = c.c_void_p
cf.CFDictionaryCreateMutable.argtypes = [ptr, c.c_long, ptr, ptr]
cf.CFDictionaryCreateMutable.restype = ptr
cf.CFDictionarySetValue.argtypes = [ptr, ptr, ptr]
cf.CFStringCreateWithCString.argtypes = [ptr, c.c_char_p, c.c_uint]
cf.CFStringCreateWithCString.restype = ptr
cf.CFDataCreate.argtypes = [ptr, c.c_char_p, c.c_long]
cf.CFDataCreate.restype = ptr
cf.CFDataGetLength.argtypes = [ptr]
cf.CFDataGetLength.restype = c.c_long
cf.CFDataGetBytePtr.argtypes = [ptr]
cf.CFDataGetBytePtr.restype = ptr
cf.CFRelease.argtypes = [ptr]
sec.SecItemCopyMatching.argtypes = [ptr, c.POINTER(ptr)]
sec.SecItemAdd.argtypes = [ptr, c.POINTER(ptr)]
sec.SecItemUpdate.argtypes = [ptr, ptr]
sec.SecItemDelete.argtypes = [ptr]


def constant(name):
    return ptr.in_dll(sec, name).value


def operation(mode, value=None, test=False):
    owned = []

    def text(value):
        result = cf.CFStringCreateWithCString(None, value.encode(), 0x08000100)
        owned.append(result)
        return result

    def dictionary(entries):
        result = cf.CFDictionaryCreateMutable(None, 0,
            c.addressof(c.c_byte.in_dll(cf, 'kCFTypeDictionaryKeyCallBacks')),
            c.addressof(c.c_byte.in_dll(cf, 'kCFTypeDictionaryValueCallBacks')))
        owned.append(result)
        for key, entry in entries:
            cf.CFDictionarySetValue(result, constant(key), entry)
        return result

    query = dictionary([
        ('kSecClass', constant('kSecClassGenericPassword')),
        ('kSecAttrService', text('com.akogare.analytics.codot')),
        ('kSecAttrAccount', text('selftest' if test else 'aggregate-reader')),
    ])
    try:
        if mode == 'get':
            cf.CFDictionarySetValue(query, constant('kSecReturnData'), ptr.in_dll(cf, 'kCFBooleanTrue').value)
            output = ptr()
            status = sec.SecItemCopyMatching(query, c.byref(output))
            if status != 0:
                raise RuntimeError('Dashboard reader key is unavailable in Keychain (%s).' % status)
            try:
                return c.string_at(cf.CFDataGetBytePtr(output), cf.CFDataGetLength(output)).decode()
            finally:
                cf.CFRelease(output)
        if mode == 'put':
            raw = value.encode()
            data = cf.CFDataCreate(None, raw, len(raw))
            owned.append(data)
            updates = dictionary([('kSecValueData', data)])
            status = sec.SecItemUpdate(query, updates)
            if status == -25300:
                cf.CFDictionarySetValue(query, constant('kSecValueData'), data)
                cf.CFDictionarySetValue(query, constant('kSecAttrAccessible'), constant('kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly'))
                status = sec.SecItemAdd(query, None)
            if status != 0:
                raise RuntimeError('Could not save the dashboard reader key (%s).' % status)
        elif mode == 'remove':
            status = sec.SecItemDelete(query)
            if status not in (0, -25300):
                raise RuntimeError('Could not remove the dashboard reader key (%s).' % status)
    finally:
        for item in reversed(owned):
            cf.CFRelease(item)


if __name__ == '__main__':
    try:
        mode = sys.argv[1]
        if mode == 'get':
            sys.stdout.write(operation(mode))
        elif mode == 'put':
            value = sys.stdin.read().strip()
            if not value.startswith('akr_') or len(value) != 47:
                raise RuntimeError('Invalid dashboard-only key.')
            operation(mode, value)
            print('Dashboard-only key saved in login Keychain.')
        elif mode == 'selftest':
            value = 'akr_' + secrets.token_urlsafe(32)
            try:
                operation('put', value, test=True)
                assert operation('get', test=True) == value
                print('Keychain round-trip passed; temporary test item removed.')
            finally:
                operation('remove', test=True)
        elif mode == 'remove':
            operation(mode)
        else:
            raise RuntimeError('Unsupported Keychain action.')
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
