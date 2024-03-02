import { Component } from 'solid-js';
import { Button } from '../../../../components/Button';
import { Icon } from '../../../../components/Icon';

interface Props {}

export const VocabularyListCreator: Component<Props> = () => {
  return (
    <form>
      <input class="input"></input>
      <input class="input"></input>
      <Button>
        Create
        <Icon icon="plus" />
      </Button>
    </form>
  );
};
