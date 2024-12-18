// XorShift
// https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
export class Random {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(seed: number) {
        this.x = 28492322;
        this.y = 14847674;
        this.z = 16314125;
        this.w = seed;
    }

    next() {
        let t;

        t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        return (this.w = this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8)));
    }

    nextInt(min: number, max: number) {
        const r = Math.abs(this.next());
        return min + (r % (max + 1 - min));
    }

    shuffleArray<T>(arrayInout: T[]) {
        let array = Array(arrayInout.length);
        for (let i = arrayInout.length - 1; i >= 0; i--) {
            const j = Math.floor(this.nextInt(0, i));
            // arrayInoutからj要素を取り出して，削除する
            array[i] = arrayInout[j];
            arrayInout.splice(j, 1);
        }
        return array;
    }
}
