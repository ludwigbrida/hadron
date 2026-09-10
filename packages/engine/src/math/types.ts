type IndexRange<
  Length extends number,
  Accumulator extends number[] = [],
> = Accumulator["length"] extends Length
  ? Accumulator[number]
  : IndexRange<Length, [...Accumulator, Accumulator["length"]]>;

type FixedFloat32Array<Length extends number> = Float32Array & { readonly length: Length } & Record<
    IndexRange<Length>,
    number
  >;

export type Vec3Storage = FixedFloat32Array<3>;

export type Mat4Storage = FixedFloat32Array<16>;
