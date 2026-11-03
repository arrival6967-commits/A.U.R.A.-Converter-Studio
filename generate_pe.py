import struct
import os

def build_pe():
    # Target Architecture: x86-64 (AMD64)
    # File alignment: 512 (0x200)
    # Section alignment: 4096 (0x1000)
    
    file_align = 0x200
    sec_align = 0x1000
    image_base = 0x140000000

    def pad(data, align_val):
        remainder = len(data) % align_val
        if remainder:
            return data + b'\x00' * (align_val - remainder)
        return data

    # Strings needed for Windows GUI & Installation
    app_url = "https://ais-pre-6fan2e54gdsoqajpyppwdg-702394825518.europe-west2.run.app"
    title_str = "A.U.R.A. Converter Studio v1.1"
    msg_str = (
        "Установка A.U.R.A. Converter Studio v1.1 успешно завершена!\r\n\r\n"
        "Разработчик: The Godot Entertaiment Inc.\r\n\r\n"
        "1. Папка программы создана:\r\n"
        "   AppData\\Local\\Programs\\AURA_Converter_Studio\r\n\r\n"
        "2. Ярлыки добавлены на ваш Рабочий стол.\r\n\r\n"
        "Папка открыта в Проводнике Windows, приложение запущено."
    )
    op_open = "open"

    # Convert to UTF-16LE with null-terminator
    w_title = (title_str + '\0').encode('utf-16le')
    w_msg = (msg_str + '\0').encode('utf-16le')
    w_op = (op_open + '\0').encode('utf-16le')
    
    # cmd.exe command to create directory, files, copy shortcuts to all desktops, run WScript lnk creator, and open folder
    cmd_payload = (
        '/c "mkdir "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio" 2>nul & '
        '(echo [InternetShortcut]&echo URL=' + app_url + '&echo IconIndex=0&echo IconFile=shell32.dll,138) > "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio\\A.U.R.A. Converter Studio.url" & '
        'copy /y "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio\\A.U.R.A. Converter Studio.url" "%USERPROFILE%\\Desktop\\A.U.R.A. Converter Studio.url" 2>nul & '
        'copy /y "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio\\A.U.R.A. Converter Studio.url" "%USERPROFILE%\\Рабочий стол\\A.U.R.A. Converter Studio.url" 2>nul & '
        'copy /y "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio\\A.U.R.A. Converter Studio.url" "%USERPROFILE%\\OneDrive\\Рабочий стол\\A.U.R.A. Converter Studio.url" 2>nul & '
        'copy /y "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio\\A.U.R.A. Converter Studio.url" "%USERPROFILE%\\OneDrive\\Desktop\\A.U.R.A. Converter Studio.url" 2>nul & '
        'copy /y "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio\\A.U.R.A. Converter Studio.url" "%PUBLIC%\\Desktop\\A.U.R.A. Converter Studio.url" 2>nul & '
        '(echo @echo off&echo start "" "' + app_url + '") > "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio\\AURA_Launcher.bat" & '
        '(echo [A.U.R.A. Converter Studio v1.1]&echo Developer: The Godot Entertaiment Inc.&echo Version: 1.1) > "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio\\version.txt" & '
        'powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell;$t=\\"$env:LOCALAPPDATA\\Programs\\AURA_Converter_Studio\\AURA_Launcher.bat\\";@(\\"$env:USERPROFILE\\Desktop\\",\\"$env:USERPROFILE\\Рабочий стол\\",\\"$env:USERPROFILE\\OneDrive\\Рабочий стол\\",\\"$env:USERPROFILE\\OneDrive\\Desktop\\",[Environment]::GetFolderPath(\'Desktop\')) | ForEach-Object { if(Test-Path $_) { $s=$w.CreateShortcut(\\"$_\\A.U.R.A. Converter Studio.lnk\\"); $s.TargetPath=$t; $s.IconLocation=\'shell32.dll,138\'; $s.Save() } }" 2>nul & '
        'start "" "%LOCALAPPDATA%\\Programs\\AURA_Converter_Studio" & '
        'start "" "' + app_url + '""'
    )
    w_cmd_exe = ("cmd.exe\0").encode('utf-16le')
    w_cmd_args = (cmd_payload + '\0').encode('utf-16le')

    # .rdata section will hold:
    # 1. Import Directory Table (3 descriptors + 1 null terminator = 4 * 20 = 80 bytes)
    # 2. ILT & IAT arrays
    # 3. Hint/Name tables
    # 4. DLL names
    # 5. Unicode string data
    
    # We will build .rdata dynamically
    rdata = bytearray()

    # Offsets within .rdata:
    # Let .rdata start at RVA 0x2000
    rdata_rva = 0x2000
    text_rva = 0x1000

    # Layout planning in .rdata:
    # 0x00: Import Directory (4 * 20 = 80 bytes)
    # KERNEL32 descriptor: ExitProcess
    # USER32 descriptor: MessageBoxW
    # SHELL32 descriptor: ShellExecuteW
    # 0x50: ILT_kernel32 (8 bytes + 8 bytes null = 16 bytes)
    # 0x60: IAT_kernel32 (16 bytes)
    # 0x70: ILT_user32 (16 bytes)
    # 0x80: IAT_user32 (16 bytes)
    # 0x90: ILT_shell32 (16 bytes)
    # 0xA0: IAT_shell32 (16 bytes)
    
    # String tables & hints:
    # 0xB0: HintName ExitProcess
    # 0xC0: HintName MessageBoxW
    # 0xD0: HintName ShellExecuteW
    # 0xE0: "KERNEL32.dll\0"
    # 0xF0: "USER32.dll\0"
    # 0x100: "SHELL32.dll\0"
    
    # Text data starts at 0x120
    
    # Let's construct precisely:
    import_dir_offset = 0
    num_dlls = 3
    import_dir_size = (num_dlls + 1) * 20
    
    ilt_k32_offset = 0x60
    iat_k32_offset = 0x70
    ilt_u32_offset = 0x80
    iat_u32_offset = 0x90
    ilt_s32_offset = 0xA0
    iat_s32_offset = 0xB0
    
    hint_exit_offset = 0xC0
    hint_msg_offset = 0xD0
    hint_shell_offset = 0xE0
    
    name_k32_offset = 0xF0
    name_u32_offset = 0x100
    name_s32_offset = 0x110
    
    strings_offset = 0x120
    
    # Reserve space up to strings_offset
    rdata.extend(b'\x00' * strings_offset)
    
    # Write Strings
    offset_w_op = len(rdata)
    rdata.extend(w_op)
    
    offset_w_cmd_exe = len(rdata)
    rdata.extend(w_cmd_exe)
    
    offset_w_cmd_args = len(rdata)
    rdata.extend(w_cmd_args)
    
    offset_w_title = len(rdata)
    rdata.extend(w_title)
    
    offset_w_msg = len(rdata)
    rdata.extend(w_msg)
    
    # Write DLL names
    dll_k32 = b"KERNEL32.dll\x00"
    rdata[name_k32_offset:name_k32_offset+len(dll_k32)] = dll_k32
    
    dll_u32 = b"USER32.dll\x00"
    rdata[name_u32_offset:name_u32_offset+len(dll_u32)] = dll_u32
    
    dll_s32 = b"SHELL32.dll\x00"
    rdata[name_s32_offset:name_s32_offset+len(dll_s32)] = dll_s32
    
    # Write Hint/Names (2 bytes hint + ASCII name + null)
    hint_exit = struct.pack('<H', 0) + b"ExitProcess\x00"
    rdata[hint_exit_offset:hint_exit_offset+len(hint_exit)] = hint_exit
    
    hint_msg = struct.pack('<H', 0) + b"MessageBoxW\x00"
    rdata[hint_msg_offset:hint_msg_offset+len(hint_msg)] = hint_msg
    
    hint_shell = struct.pack('<H', 0) + b"ShellExecuteW\x00"
    rdata[hint_shell_offset:hint_shell_offset+len(hint_shell)] = hint_shell
    
    # Write ILT and IAT entries (64-bit pointers to Hint/Name RVA)
    # KERNEL32: ExitProcess
    entry_k32 = struct.pack('<Q', rdata_rva + hint_exit_offset)
    rdata[ilt_k32_offset:ilt_k32_offset+8] = entry_k32
    rdata[iat_k32_offset:iat_k32_offset+8] = entry_k32
    
    # USER32: MessageBoxW
    entry_u32 = struct.pack('<Q', rdata_rva + hint_msg_offset)
    rdata[ilt_u32_offset:ilt_u32_offset+8] = entry_u32
    rdata[iat_u32_offset:iat_u32_offset+8] = entry_u32
    
    # SHELL32: ShellExecuteW
    entry_s32 = struct.pack('<Q', rdata_rva + hint_shell_offset)
    rdata[ilt_s32_offset:ilt_s32_offset+8] = entry_s32
    rdata[iat_s32_offset:iat_s32_offset+8] = entry_s32
    
    # Write Import Directory Descriptors
    # Descriptor 1: KERNEL32
    desc1 = struct.pack('<IIIII',
        rdata_rva + ilt_k32_offset, # OriginalFirstThunk
        0, # TimeDateStamp
        0, # ForwarderChain
        rdata_rva + name_k32_offset, # Name
        rdata_rva + iat_k32_offset  # FirstThunk (IAT)
    )
    rdata[0:20] = desc1
    
    # Descriptor 2: USER32
    desc2 = struct.pack('<IIIII',
        rdata_rva + ilt_u32_offset,
        0,
        0,
        rdata_rva + name_u32_offset,
        rdata_rva + iat_u32_offset
    )
    rdata[20:40] = desc2
    
    # Descriptor 3: SHELL32
    desc3 = struct.pack('<IIIII',
        rdata_rva + ilt_s32_offset,
        0,
        0,
        rdata_rva + name_s32_offset,
        rdata_rva + iat_s32_offset
    )
    rdata[40:60] = desc3
    # 60:80 is all zeroes (Null terminator descriptor)

    # Now let's assemble .text (Code section at RVA 0x1000)
    # The code needs to call:
    # 1. ShellExecuteW(NULL, L"open", L"powershell.exe", L"-WindowStyle Hidden -Command ...", NULL, 0)
    # 2. MessageBoxW(NULL, w_msg, w_title, MB_OK | MB_ICONINFORMATION)
    # 3. ExitProcess(0)
    
    text = bytearray()
    
    # sub rsp, 0x48 (stack alignment & shadow space)
    text.extend(b'\x48\x83\xEC\x48')
    
    # Helper to calculate RIP-relative displacement:
    # disp32 = target_rva - (curr_inst_rva + inst_len)
    def rip_disp(target_rva, next_inst_rva):
        return struct.pack('<i', target_rva - next_inst_rva)

    # --- Call 1: ShellExecuteW ---
    # xor rcx, rcx
    text.extend(b'\x48\x31\xC9')
    
    # lea rdx, [rip + w_op]
    # instruction length = 7 (48 8D 15 [disp32])
    disp = rip_disp(rdata_rva + offset_w_op, text_rva + len(text) + 7)
    text.extend(b'\x48\x8D\x15' + disp)
    
    # lea r8, [rip + w_cmd_exe]
    # instruction length = 7 (4C 8D 05 [disp32])
    disp = rip_disp(rdata_rva + offset_w_cmd_exe, text_rva + len(text) + 7)
    text.extend(b'\x4C\x8D\x05' + disp)
    
    # lea r9, [rip + w_cmd_args]
    # instruction length = 7 (4C 8D 0D [disp32])
    disp = rip_disp(rdata_rva + offset_w_cmd_args, text_rva + len(text) + 7)
    text.extend(b'\x4C\x8D\x0D' + disp)
    
    # mov qword ptr [rsp + 0x20], 0 (lpDirectory = NULL)
    text.extend(b'\x48\xC7\x44\x24\x20\x00\x00\x00\x00')
    
    # mov dword ptr [rsp + 0x28], 0 (nShowCmd = SW_HIDE = 0)
    text.extend(b'\xC7\x44\x24\x28\x00\x00\x00\x00')
    
    # call qword ptr [rip + iat_shell32]
    # instruction length = 6 (FF 15 [disp32])
    disp = rip_disp(rdata_rva + iat_s32_offset, text_rva + len(text) + 6)
    text.extend(b'\xFF\x15' + disp)
    
    # --- Call 2: MessageBoxW ---
    # xor rcx, rcx (hwnd = NULL)
    text.extend(b'\x48\x31\xC9')
    
    # lea rdx, [rip + w_msg] (lpText)
    disp = rip_disp(rdata_rva + offset_w_msg, text_rva + len(text) + 7)
    text.extend(b'\x48\x8D\x15' + disp)
    
    # lea r8, [rip + w_title] (lpCaption)
    disp = rip_disp(rdata_rva + offset_w_title, text_rva + len(text) + 7)
    text.extend(b'\x4C\x8D\x05' + disp)
    
    # mov r9d, 0x40 (MB_OK | MB_ICONINFORMATION)
    text.extend(b'\x41\xB9\x40\x00\x00\x00')
    
    # call qword ptr [rip + iat_user32]
    disp = rip_disp(rdata_rva + iat_u32_offset, text_rva + len(text) + 6)
    text.extend(b'\xFF\x15' + disp)
    
    # --- Call 3: ExitProcess(0) ---
    # xor ecx, ecx (uExitCode = 0)
    text.extend(b'\x31\xC9')
    
    # call qword ptr [rip + iat_kernel32]
    disp = rip_disp(rdata_rva + iat_k32_offset, text_rva + len(text) + 6)
    text.extend(b'\xFF\x15' + disp)

    # Pad sections to file alignment (0x200)
    padded_text = pad(text, file_align)
    padded_rdata = pad(rdata, file_align)

    # Size calculations
    headers_size = 0x400 # 1024 bytes (file aligned)
    raw_text_size = len(padded_text)
    raw_rdata_size = len(padded_rdata)

    text_virt_size = len(text)
    rdata_virt_size = len(rdata)

    image_size = sec_align + 0x1000 + 0x1000 # 0x3000

    # Build Headers
    headers = bytearray(headers_size)
    
    # 1. DOS Header
    headers[0:2] = b'MZ'
    struct.pack_into('<H', headers, 0x02, 0x0090)
    struct.pack_into('<H', headers, 0x04, 0x0003)
    struct.pack_into('<H', headers, 0x08, 0x0004)
    struct.pack_into('<H', headers, 0x0C, 0xFFFF)
    struct.pack_into('<H', headers, 0x12, 0x00B8)
    struct.pack_into('<H', headers, 0x18, 0x0040)
    struct.pack_into('<I', headers, 0x3C, 0x0080) # PE signature offset
    
    # DOS Stub
    stub = b"This program cannot be run in DOS mode.\r\r\n$"
    headers[0x4E:0x4E+len(stub)] = stub
    
    # 2. PE Signature
    headers[0x80:0x84] = b'PE\x00\x00'
    
    # 3. COFF Header
    coff_offset = 0x84
    struct.pack_into('<HHIIIHH', headers, coff_offset,
        0x8664, # AMD64
        2,      # NumberOfSections (.text, .rdata)
        0x67300000, # TimeDateStamp
        0, 0,
        0x00F0, # SizeOfOptionalHeader
        0x0022  # Characteristics: EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE
    )
    
    # 4. Optional Header (PE32+)
    opt_offset = coff_offset + 20
    struct.pack_into('<HBBIIIIIQIIHHHHHHIIIIHHQQQQII', headers, opt_offset,
        0x020B, # PE32+ (1)
        0x0E, 0x1E, # Linker (2, 3)
        raw_text_size, # SizeOfCode (4)
        raw_rdata_size, # SizeOfInitializedData (5)
        0, # UninitializedData (6)
        text_rva, # AddressOfEntryPoint (7)
        text_rva, # BaseOfCode (8)
        image_base, # ImageBase (9: Q)
        sec_align, # SectionAlignment (10: I)
        file_align, # FileAlignment (11: I)
        6, 0, # OS Version 6.0 (12, 13: H, H)
        0, 0, # Image Version (14, 15: H, H)
        6, 0, # Subsystem Version 6.0 (16, 17: H, H)
        0,    # Win32VersionValue (18: I)
        image_size, # SizeOfImage (19: I)
        headers_size, # SizeOfHeaders (20: I)
        0,    # CheckSum (21: I)
        2,    # Subsystem: IMAGE_SUBSYSTEM_WINDOWS_GUI (22: H)
        0x8160, # DllCharacteristics (23: H)
        0x100000, 0x1000, # Stack reserve/commit (24, 25: Q, Q)
        0x100000, 0x1000, # Heap reserve/commit (26, 27: Q, Q)
        0, # LoaderFlags (28: I)
        16 # NumberOfRvaAndSizes (29: I)
    )
    
    # Data Directories (offset = opt_offset + 112)
    dd_offset = opt_offset + 112
    # Import Directory is Index 1 (offset = dd_offset + 8)
    struct.pack_into('<II', headers, dd_offset + 8, rdata_rva, import_dir_size)
    # IAT Directory is Index 12 (offset = dd_offset + 96)
    iat_rva = rdata_rva + iat_k32_offset
    iat_size = (iat_s32_offset + 16) - iat_k32_offset
    struct.pack_into('<II', headers, dd_offset + 96, iat_rva, iat_size)
    
    # 5. Section Headers (offset = opt_offset + 240)
    sec_headers_offset = opt_offset + 240
    
    # Section 1: .text
    struct.pack_into('<8sIIIIIIHHI', headers, sec_headers_offset,
        b'.text\x00\x00\x00',
        text_virt_size,
        text_rva,
        raw_text_size,
        headers_size, # Raw pointer in file
        0, 0, 0, 0,
        0x60000020 # IMAGE_SCN_CNT_CODE | IMAGE_SCN_MEM_EXECUTE | IMAGE_SCN_MEM_READ
    )
    
    # Section 2: .rdata
    struct.pack_into('<8sIIIIIIHHI', headers, sec_headers_offset + 40,
        b'.rdata\x00\x00',
        rdata_virt_size,
        rdata_rva,
        raw_rdata_size,
        headers_size + raw_text_size, # Raw pointer in file
        0, 0, 0, 0,
        0x40000040 # IMAGE_SCN_CNT_INITIALIZED_DATA | IMAGE_SCN_MEM_READ
    )
    
    # Combine full executable
    pe_file = headers + padded_text + padded_rdata
    return pe_file

if __name__ == '__main__':
    exe_bytes = build_pe()
    os.makedirs('public', exist_ok=True)
    with open('public/AURA_Converter_Studio_v1.1_Setup.exe', 'wb') as f:
        f.write(exe_bytes)
    print(f"Successfully generated public/AURA_Converter_Studio_v1.1_Setup.exe ({len(exe_bytes)} bytes)")
