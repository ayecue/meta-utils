const { Container, Signature } = require('../dist');
const GeneralSignatures = require('./mocks/signatures/general.json');
const StringSignatures = require('./mocks/signatures/string.json');
const SubStringSignatures = require('./mocks/signatures/sub-string.json');
const EN = require('./mocks/descriptions/en');

describe('collection', () => {
  let meta = null;

  beforeEach(() => {
    meta = new Container();

    meta.addTypeSignatureFromPayload(GeneralSignatures);
    meta.addTypeSignatureFromPayload(StringSignatures);
    meta.addTypeSignatureFromPayload(SubStringSignatures);

    meta.addMeta('en', EN);
  });

  test('should return signatures', () => {
    expect(meta.getTypeSignature('general').toJSON()).toEqual(Signature.parse(GeneralSignatures).toJSON());
  });

  test('should return description', () => {
    expect(meta.getDefinition('general', 'print').description).toEqual(EN.general.print.description);
  });

  test('should return example', () => {
    expect(meta.getDefinition('general', 'print').example).toEqual(EN.general.print.example);
  });

  test('should return definition', () => {
    expect(meta.getDefinition(['string'], 'split').toJSON()).toMatchSnapshot();
  });

  test('should return property definition', () => {
    expect(meta.getDefinition('sub-string', 'myProperty').toJSON()).toMatchSnapshot();
  });

  test('should return definitions of child definition', () => {
    expect(meta.getDefinition(['sub-string'], 'split').toJSON()).toMatchSnapshot();
  });

  test('should return definitions of parent definition', () => {
    expect(meta.getDefinition(['sub-string'], 'hasIndex').toJSON()).toMatchSnapshot();
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

    expect(result.getDefinition('general', 'print').description).toEqual('test');
    expect(meta.getDefinition('general', 'print').description).toEqual(EN.general.print.description);
  });
});