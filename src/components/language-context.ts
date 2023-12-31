import { Accessor, createContext } from 'solid-js';
import { Lang } from '../model/lang';

export const LangContext = createContext<Accessor<Lang>>(() => 'pt' as Lang);
