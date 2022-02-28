import { applicative, apply, either, functor, monad, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";

export type CancellableTaskEither<R, E, A> = taskEither.TaskEither<
  R,
  either.Either<E, A>
>;
const URI = "CancellableTaskEither";
type URI = typeof URI;

// TODO: the following could be simplified by using eitherT
export const of = flow(either.right, taskEither.right);

export const map =
  <A, B>(f: (a: A) => B) =>
  <R, E>(fa: CancellableTaskEither<R, E, A>): CancellableTaskEither<R, E, B> =>
    pipe(fa, taskEither.map(either.map(f)));

export const chain =
  <R, E, A, B>(f: (a: A) => CancellableTaskEither<R, E, B>) =>
  (ma: CancellableTaskEither<R, E, A>) =>
    pipe(
      ma,
      taskEither.chain(
        either.match((error) => taskEither.right(either.left(error)), f)
      )
    );

declare module "fp-ts/HKT" {
  interface URItoKind3<R, E, A> {
    readonly [URI]: CancellableTaskEither<R, E, A>;
  }
}
export const Functor: functor.Functor3<URI> = {
  URI,
  map: (fa, f) => pipe(fa, map(f)),
};

export const ApplyPar: apply.Apply3<URI> = {
  ...Functor,
  ap: <R, E, A, B>(
    fab: CancellableTaskEither<R, E, (a: A) => B>,
    fa: CancellableTaskEither<R, E, A>
  ) =>
    apply.ap(
      taskEither.ApplyPar,
      either.Apply as apply.Apply2C<"Either", E>
    )(fa)(fab),
};

export const ApplicativePar: applicative.Applicative3<URI> = {
  ...ApplyPar,
  of,
};

export const ApplySeq: apply.Apply3<URI> = {
  ...Functor,
  ap: <R, E, A, B>(
    fab: CancellableTaskEither<R, E, (a: A) => B>,
    fa: CancellableTaskEither<R, E, A>
  ) =>
    apply.ap(
      taskEither.ApplySeq,
      either.Apply as apply.Apply2C<"Either", E>
    )(fa)(fab),
};

export const ApplicativeSeq: applicative.Applicative3<URI> = {
  ...ApplySeq,
  of,
};

export const Monad: monad.Monad3<URI> = {
  ...ApplyPar,
  of,
  chain: (ma, f) => pipe(ma, chain(f)),
};
