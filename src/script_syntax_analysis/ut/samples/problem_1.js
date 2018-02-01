function gall8(jg, vs) {
    var hy, ae, rlr, y17;
    y17 = 0;
    rlr = 0;
    while (rlr < 4) {
        ae = fussyq(jg, vs + rlr, 'char');
        hy = serfp['index' + 'Of'](ae);
        hy = hy & 0x3f;
        y17 |= hy << (3 - rlr) * 6;
        rlr++
    }
    return y17
}
jaysq();
