use std::{wrapping_mul, wrapping_add, wrapping_sub};

fn main(x: Field, y: pub Field) {
    assert(x != y);
}

#[test]
fn test_main() {
    main(1, 2);
}

#[test]
fn test_temp() {
    let a: u8 = 100;
    let b: u8 = 200;
    let res: u8 = wrapping_mul(a, b);
    print(res);
}
