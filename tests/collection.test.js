const { Collection } = require('../dist');
const GeneralSignatures = require('./mocks/signatures/general.json');
const StringSignatures = require('./mocks/signatures/string.json');
const EN = require('./mocks/descriptions/en');

describe('collection', () => {
  let meta = null;

  beforeEach(() => {
    meta = new Collection();

    meta.addSignature('any', {});
    meta.addSignature('general', GeneralSignatures);
    meta.addSignature('string', StringSignatures);

    meta.addMeta('en', EN);
  });

  test('should return signatures', () => {
    expect(meta.getSignaturesByType('general')).toEqual(GeneralSignatures);
  });

  test('should return description', () => {
    expect(meta.getDescription('general', 'print')).toEqual(EN.general.print.description);
  });

  test('should return example', () => {
    expect(meta.getExample('general', 'print')).toEqual(EN.general.print.example);
  });

  test('should return definitions', () => {
    const result = meta.getDefinitions(['string']);

    expect(result.split).toEqual({
      arguments: StringSignatures.split.arguments,
      returns: StringSignatures.split.returns,
      description: EN.string.split.description,
      example: EN.string.split.example
    });
  });

  test('should return definition', () => {
    expect(meta.getDefinition(['string'], 'split')).toEqual({
      arguments: StringSignatures.split.arguments,
      returns: StringSignatures.split.returns,
      description: EN.string.split.description,
      example: EN.string.split.example
    });
  });

  test('should create fork', () => {
    const result = meta.fork();

    expect(result.signatures).toEqual(meta.signatures);
    expect(result.meta).toEqual(meta.meta);
  });

  test('should override fork but keep original', () => {
    const result = meta.fork();

    result.addMeta('en', {
      'general': {
        'print': {
          description: 'test',
          example: ['test']
        }
      }
    });

    expect(result.getDescription('general', 'print')).toEqual('test');
    expect(meta.getDescription('general', 'print')).toEqual(EN.general.print.description);
  });
});