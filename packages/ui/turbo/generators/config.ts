import type { PlopTypes } from '@turbo/gen';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('component', {
    description: 'Adds a new react component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the component?',
        validate: (input) => {
          if (!input) return 'Component name is required';
          return true;
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{kebabCase name}}/{{kebabCase name}}.tsx',
        templateFile: 'templates/component.hbs',
      },
    ],
  });

  plop.setGenerator('story', {
    description: 'Adds a new storybook story for existing component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the component?',
        validate: (input) => {
          if (!input) return 'Component name is required';
          return true;
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/{{kebabCase name}}/{{kebabCase name}}.stories.tsx',
        templateFile: 'templates/story.hbs',
      },
    ],
  });

  plop.setGenerator('딸깍', {
    description: 'Adds a new react component with storybook story',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the component?',
        validate: (input) => {
          if (!input) return 'Component name is required';
          return true;
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{kebabCase name}}/{{kebabCase name}}.tsx',
        templateFile: 'templates/component.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{kebabCase name}}/{{kebabCase name}}.stories.tsx',
        templateFile: 'templates/story.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{kebabCase name}}/index.ts',
        templateFile: 'templates/index.hbs',
      },
    ],
  });
}
