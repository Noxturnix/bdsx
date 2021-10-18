"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bin = void 0;
function shrinkZero(values) {
    for (let j = values.length - 1; j >= 0; j--) {
        if (values[j] !== 0) {
            values.length = j + 1;
            break;
        }
    }
}
function add_with_offset(a, b, offset) {
    let minn;
    let maxn;
    const alen = a.length;
    const blen = offset + b.length;
    let maxoff;
    if (alen < blen) {
        minn = a.length;
        maxn = blen;
        maxoff = offset;
    }
    else {
        minn = blen;
        maxn = a.length;
        maxoff = 0;
    }
    let v = 0;
    let i = 0;
    for (; i < minn; i++) {
        v += a[i];
        v += b.charCodeAt(i - offset);
        a[i] = v & 0xffff;
        v >>= 16;
    }
    if (alen < blen) {
        for (; i < maxn; i++) {
            v += b.charCodeAt(i - maxoff);
            a.push(v & 0xffff);
            v >>= 16;
        }
    }
    else {
        for (; i < maxn; i++) {
            v += a[i];
            a[i] = v & 0xffff;
            v >>= 16;
            if (v === 0)
                return;
        }
    }
    a.push(v);
}
var bin;
(function (bin) {
    function isZero(value) {
        for (let i = 0; i < value.length; i++) {
            if (value.charCodeAt(i) !== 0)
                return false;
        }
        return true;
    }
    bin.isZero = isZero;
    function uint8(value) {
        return value.length !== 0 ? value.charCodeAt(0) & 0xff : 0;
    }
    bin.uint8 = uint8;
    function uint16(value) {
        return value.length !== 0 ? value.charCodeAt(0) : 0;
    }
    bin.uint16 = uint16;
    function int32(value) {
        if (value.length >= 2) {
            return (value.charCodeAt(1) << 16) | value.charCodeAt(0);
        }
        else if (value.length === 0) {
            return 0;
        }
        else {
            return value.charCodeAt(0);
        }
    }
    bin.int32 = int32;
    function int32_high(value) {
        if (value.length >= 4) {
            return (value.charCodeAt(3) << 16) | value.charCodeAt(2);
        }
        else if (value.length >= 3) {
            return value.charCodeAt(2);
        }
        else {
            return 0;
        }
    }
    bin.int32_high = int32_high;
    function int32_2(value) {
        if (value.length >= 4) {
            return [
                (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                (value.charCodeAt(3) << 16) | value.charCodeAt(2),
            ];
        }
        if (value.length >= 2) {
            if (value.length === 3) {
                return [
                    (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                    value.charCodeAt(2),
                ];
            }
            else {
                return [
                    (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                    0,
                ];
            }
        }
        else if (value.length === 0) {
            return [0, 0];
        }
        else {
            return [
                value.charCodeAt(0),
                0,
            ];
        }
    }
    bin.int32_2 = int32_2;
    function make64(low, high) {
        const v1 = low & 0xffff;
        const v2 = low >>> 16;
        const v3 = high & 0xffff;
        const v4 = high >>> 16;
        return String.fromCharCode(v1, v2, v3, v4);
    }
    bin.make64 = make64;
    function make128(a, b, c, d) {
        const a1 = a & 0xffff;
        const a2 = a >>> 16;
        const b1 = b & 0xffff;
        const b2 = b >>> 16;
        const c1 = c & 0xffff;
        const c2 = c >>> 16;
        const d1 = d & 0xffff;
        const d2 = d >>> 16;
        return String.fromCharCode(a1, a2, b1, b2, c1, c2, d1, d2);
    }
    bin.make128 = make128;
    function toNumber(v) {
        let out = 0;
        let mult = 1;
        const len = v.length;
        for (let i = 0; i < len; i++) {
            out += v.charCodeAt(i) * mult;
            mult *= 0x10000;
        }
        return out;
    }
    bin.toNumber = toNumber;
    function makeVar(n) {
        n = Math.floor(n);
        if (n < 0)
            n = 0;
        const out = [];
        for (let i = 0; n !== 0; i++) {
            out[i] = n % 0x10000;
            n = Math.floor(n / 0x10000);
        }
        return String.fromCharCode(...out);
    }
    bin.makeVar = makeVar;
    function make(n, size) {
        n = Math.floor(n);
        if (n < 0)
            n = 0;
        const out = new Array(size);
        for (let i = 0; i < size; i++) {
            out[i] = n % 0x10000;
            n = Math.floor(n / 0x10000);
        }
        return String.fromCharCode(...out);
    }
    bin.make = make;
    function fromBuffer(buffer, pad = 0) {
        const dest = new Uint16Array((buffer.length + 1) >> 1);
        const words = buffer.length & ~1;
        let j = 0;
        let i = 0;
        for (; i !== words;) {
            const low = buffer[i++];
            const high = buffer[i++];
            dest[j++] = (high << 16) | low;
        }
        if (i !== buffer.length) {
            const low = buffer[i];
            dest[j++] = (pad << 16) | low;
        }
        return String.fromCharCode(...dest);
    }
    bin.fromBuffer = fromBuffer;
    function toString(v, radix = 10) {
        let len = v.length;
        do {
            if (len === 0)
                return '\0';
            len--;
        } while (v.charCodeAt(len) === 0);
        len++;
        v = v.substr(0, len);
        const out = [];
        for (;;) {
            const [quotient, remainder] = bin.divn(v, radix);
            if (remainder < 10) {
                out.push(remainder + 0x30);
            }
            else {
                out.push(remainder + (0x61 - 10));
            }
            v = quotient;
            const last = v.length - 1;
            if (v.charCodeAt(last) === 0)
                v = v.substr(0, last);
            if (v === '')
                break;
        }
        out.reverse();
        return String.fromCharCode(...out);
    }
    bin.toString = toString;
    function add(a, b) {
        let maxtext;
        let minn;
        let maxn;
        if (a.length < b.length) {
            maxtext = b;
            minn = a.length;
            maxn = b.length;
        }
        else {
            maxtext = a;
            minn = b.length;
            maxn = a.length;
        }
        const values = new Array(maxn);
        let v = 0;
        let i = 0;
        for (; i < minn; i++) {
            v += a.charCodeAt(i);
            v += b.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        for (; i < maxn; i++) {
            v += maxtext.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        // if (v !== 0) values.push(v);
        return String.fromCharCode(...values);
    }
    bin.add = add;
    function zero(size) {
        return '\0'.repeat(size);
    }
    bin.zero = zero;
    function sub(a, b) {
        const alen = a.length;
        const blen = b.length;
        const values = new Array(alen);
        let v = 0;
        for (let i = alen; i < blen; i++) {
            if (b.charCodeAt(i) !== 0)
                return bin.zero(alen);
        }
        let i = 0;
        for (; i < blen; i++) {
            v += a.charCodeAt(i);
            v -= b.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        for (; i < alen; i++) {
            v += a.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        if (v !== 0)
            return bin.zero(alen);
        // shrinkZero(values);
        return String.fromCharCode(...values);
    }
    bin.sub = sub;
    function divn(a, b) {
        const alen = a.length;
        const out = new Array(alen);
        let v = 0;
        for (let i = a.length - 1; i >= 0; i--) {
            v *= 0x10000;
            v += a.charCodeAt(i);
            out[i] = Math.floor(v / b);
            v %= b;
        }
        // shrinkZero(values);
        return [String.fromCharCode(...out), v];
    }
    bin.divn = divn;
    function muln(a, b) {
        let v = 0;
        const n = a.length;
        const out = new Array(n);
        for (let i = 0; i < n; i++) {
            v += a.charCodeAt(i) * b;
            out[i] = v % 0x10000;
            v = Math.floor(v / 0x10000);
        }
        // while (v !== 0)
        // {
        //     out.push(v % 0x10000);
        //     v = Math.floor(v / 0x10000);
        // }
        return String.fromCharCode(...out);
    }
    bin.muln = muln;
    function mul(a, b) {
        const out = [];
        const alen = a.length;
        const blen = b.length;
        for (let j = 0; j < blen; j++) {
            const bn = b.charCodeAt(j);
            for (let i = 0; i < alen; i++) {
                add_with_offset(out, bin.muln(a, bn), j);
            }
        }
        return String.fromCharCode(...out);
    }
    bin.mul = mul;
    function bitand(a, b) {
        const minlen = Math.min(a.length, b.length);
        const out = new Array(minlen);
        for (let i = 0; i < minlen; i++) {
            out[i] = a.charCodeAt(i) & b.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    bin.bitand = bitand;
    function bitor(a, b) {
        let minstr;
        let maxstr;
        if (a.length < b.length) {
            minstr = a;
            maxstr = b;
        }
        else {
            maxstr = a;
            minstr = b;
        }
        const minlen = minstr.length;
        const maxlen = maxstr.length;
        const out = new Array(maxlen);
        let i = 0;
        for (; i < minlen; i++) {
            out[i] = maxstr.charCodeAt(i) | minstr.charCodeAt(i);
        }
        for (; i < maxlen; i++) {
            out[i] = maxstr.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    bin.bitor = bitor;
    function bitxor(a, b) {
        let minstr;
        let maxstr;
        if (a.length < b.length) {
            minstr = a;
            maxstr = b;
        }
        else {
            maxstr = a;
            minstr = b;
        }
        const minlen = minstr.length;
        const maxlen = maxstr.length;
        const out = new Array(maxlen);
        let i = 0;
        for (; i < minlen; i++) {
            out[i] = maxstr.charCodeAt(i) ^ minstr.charCodeAt(i);
        }
        for (; i < maxlen; i++) {
            out[i] = maxstr.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    bin.bitxor = bitxor;
    /**
     * bitwise shift right
     */
    function bitshr(a, shift) {
        const len = a.length;
        const values = new Array(len);
        let srci = (shift + 15) >> 4;
        shift -= (srci << 4) - 16;
        const ishift = 16 - shift;
        let dsti = 0;
        let v = 0;
        if (srci !== 0) {
            v = a.charCodeAt(srci - 1) >> shift;
        }
        while (srci < len) {
            const c = a.charCodeAt(srci++);
            v |= c << ishift;
            values[dsti++] = v;
            v <<= 16;
            v |= c >> shift;
        }
        while (dsti < len) {
            values[dsti++] = 0;
        }
        return String.fromCharCode(...values);
    }
    bin.bitshr = bitshr;
    /**
     * bitwise shift right
     */
    function bitshl(a, shift) {
        const len = a.length;
        const values = new Array(len);
        let dsti = shift >> 4;
        shift &= 0xf;
        let srci = 0;
        let v = 0;
        for (let i = 0; i < dsti; i++) {
            values[i++] = 0;
        }
        while (dsti < len) {
            v |= a.charCodeAt(srci++) << shift;
            values[dsti++] = v;
            v >>= 16;
        }
        return String.fromCharCode(...values);
    }
    bin.bitshl = bitshl;
    function neg(a) {
        const n = a.length;
        if (n === 0)
            return a;
        let carry = 0;
        const out = new Array(n);
        let i = 0;
        {
            const v = a.charCodeAt(0);
            out[i] = -v;
            carry = +(v === 0);
        }
        for (; i < n; i++) {
            carry = (~a.charCodeAt(i)) + carry;
            out[i] = carry & 0xffff;
            carry >>= 16;
        }
        return String.fromCharCode(...out);
    }
    bin.neg = neg;
    function reads32(str) {
        const n = str.length;
        const dwords = n & ~1;
        const outn = (n & 1) + dwords;
        const out = new Array(outn);
        let i = 0;
        for (; i < dwords; i++) {
            const i2 = i * 2;
            out[i] = str.charCodeAt(i2) | (str.charCodeAt(i2 + 1) << 16);
        }
        if (dwords !== outn) {
            out[i] = str.charCodeAt(i * 2);
        }
        return out;
    }
    bin.reads32 = reads32;
    /**
     * makes as hex bytes
     */
    function hex(a) {
        const out = [];
        function write(v) {
            if (v < 10) {
                out.push(v + 0x30);
            }
            else {
                out.push(v + (0x61 - 10));
            }
        }
        const n = a.length;
        for (let i = 0; i < n; i++) {
            const v = a.charCodeAt(i);
            write((v >> 4) & 0xf);
            write(v & 0xf);
            write((v >> 12) & 0xf);
            write((v >> 8) & 0xf);
        }
        return String.fromCharCode(...out);
    }
    bin.hex = hex;
    function as64(v) {
        const n = v.length;
        if (n === 4)
            return v;
        if (n > 4)
            return v.substr(0, 4);
        return v + '\0'.repeat(4 - n);
    }
    bin.as64 = as64;
})(bin = exports.bin || (exports.bin = {}));
//# sourceMappingURL=bin.js.map