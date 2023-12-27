import { Component } from 'solid-js';
import { ConjugationByTense } from '../../models/conjugation';

interface Props {
  conjugations: ConjugationByTense[];
}

export const ConjugationsTester: Component<Props> = props => {
  return <div>{props.conjugations.length}</div>;
};
