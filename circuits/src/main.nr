fn main(x: Field, y: pub Field) {
    assert(x != y);
}

#[test]
fn test_main() {
    main(1, 2);
}

#[test]
fn test_temp() {
    let a: Field = 300;
    let res: [u8; 40] = a.to_be_bytes();
    print(res);
}
