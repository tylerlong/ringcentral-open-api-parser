import { NamedSchema } from '../../types';

/**
 * fix creation of greeting
 * https://git.ringcentral.com/platform/api-metadata-specs/issues/48
 * https://jira.ringcentral.com/browse/PLD-1240
 * @param schemas
 * @returns
 */
export const fixGreeting = (schemas: NamedSchema[]): NamedSchema[] => {
  const createCompanyGreeting = schemas.find((schema) => schema.name === 'CreateCompanyGreetingRequest')!;
  delete createCompanyGreeting.properties!.answeringRuleId;
  const createCustomUserGreeting = schemas.find((schema) => schema.name === 'CreateCustomUserGreetingRequest')!;
  delete createCustomUserGreeting.properties!.answeringRuleId;
  createCompanyGreeting.properties!.answeringRule = createCustomUserGreeting.properties!.answeringRule = {
    $ref: '#/components/schemas/GreetingAnsweringRuleId',
  };
  schemas.push({
    type: 'object',
    name: 'GreetingAnsweringRuleId',
    description: "Greeting's answering rule id",
    properties: {
      id: {
        type: 'string',
        description: 'Internal identifier of an answering rule',
      },
    },
  });
  return schemas;
};
