export class TarFile {

    private endClearance = new Uint8Array(1024);
    private buffer = new Uint8Array(0);

    add(data: Uint8Array, name: string) {
        const header = new Uint8Array(512);

        for (let i = 0 ; i < 100 ; i++) {
            if (i >= name.length) {
                header.set([0], i);
            } else {
                header.set([name.charCodeAt(i)], i);
            }
        }
        header.set([0x30, 0x30, 0x30, 0x36, 0x34, 0x34, 0x20, 0x00], 100); // mode
        header.set([0x30, 0x30, 0x30, 0x37, 0x36, 0x35, 0x20, 0x00], 108); // owner
        header.set([0x30, 0x30, 0x30, 0x30, 0x32, 0x34, 0x20, 0x00], 116); // group

        const length = data.length.toString(8).padStart(11, '0') + ' ';
        for (let i = 0 ; i < length.length ; i++) {
            header[124 + i] = length.charCodeAt(i);
        }
        header.set([0x31, 0x33, 0x36, 0x36, 0x32, 0x30, 0x33, 0x32, 0x35, 0x35, 0x30, 0x20], 136);
        header.set([0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20], 148);
        header.set([0x30], 156);

        header.set([0x75, 0x73, 0x74, 0x61, 0x72, 0x00, 0x30, 0x30], 257);
        header.set([0x68, 0x6d, 0x69, 0x6c], 265); // uname
        header.set([0x73, 0x74, 0x61, 0x66, 0x66], 297); // gname
        header.set([0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x00], 329); // devmajor
        header.set([0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x00], 337); // devminor

        let chksum = 0;
        for (let i = 0 ; i < header.length ; i++) {
            chksum += header[i];
        }

        const checksum = chksum.toString(8).padStart(6, '0') + '  ';
        for (let i = 0 ; i < checksum.length ; i++) {
            header[148 + i] = checksum.charCodeAt(i);
        }
        header[154] = 0;

        const padding = 512 - data.length % 512;

        const next = new Uint8Array(this.buffer.length + 512 + data.length + padding);
        next.set(this.buffer, 0);
        next.set(header, this.buffer.length);
        next.set(data, this.buffer.length + 512);
        this.buffer = next;
    }

    toDataURL(): Promise<string> {
        const blob = new Blob([this.buffer, this.endClearance], { type: 'application/x-tar' });

        return new Promise(resolve => {
            resolve( window.URL.createObjectURL(blob));
        });
    }
}
