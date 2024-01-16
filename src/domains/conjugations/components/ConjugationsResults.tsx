import { For } from 'solid-js';
import { Component } from 'solid-js';
import { ConjugationValidations } from './ConjugationsTester';

interface Props {
  conjugationsResults: ConjugationValidations;
  onPracticeIncorrect: () => void;
  onTryAgain: () => void;
  onTryDifferent: () => void;
}

export const ConjugationsResults: Component<Props> = props => {
  return (
    <div>
      <h2>Results</h2>
      <div class="flex gap-8">
        <For each={Object.keys(props.conjugationsResults)}>
          {tense => (
            <div>
              <h3>{tense}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Expected</th>
                    <th>Actual</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={props.conjugationsResults[tense]}>
                    {conjugationResult => (
                      <tr>
                        <td>{conjugationResult.conjugation.person}</td>
                        <td>{conjugationResult.conjugation.conjugatedVerb}</td>
                        <td>{conjugationResult.answer}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          )}
        </For>
      </div>
      <div>
        <button onClick={props.onTryAgain}>Try again</button>
        <button onClick={props.onPracticeIncorrect}>Practice incorrect</button>
        <button onClick={props.onTryDifferent}>Try different</button>
      </div>
    </div>
  );
};
