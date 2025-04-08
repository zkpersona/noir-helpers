fn main(x: Field, y: pub Field) {
    assert(x != y);
}

#[test]
fn test_main() {
    main(1, 2);
}

pub struct A {
    x: u8,
    y: BoundedVec<u8, 8>,
}

#[test]
fn test_temp() {
    let a = true;
    a.
}
