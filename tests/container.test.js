const { Container, Signature, VariationRegistry } = require('../dist');
const AnySignatures = require('./mocks/signatures/any.json');
const GeneralSignatures = require('./mocks/signatures/general.json');
const StringSignatures = require('./mocks/signatures/string.json');
const ListSignatures = require('./mocks/signatures/list.json');
const MapSignatures = require('./mocks/signatures/map.json');
const SubStringSignatures = require('./mocks/signatures/sub-string.json');
const NotSearchableSignature = require('./mocks/signatures/not-searchable.json');
const EN = require('./mocks/descriptions/en');

describe('container', () => {
  let meta = null;

  beforeEach(() => {
    VariationRegistry.add('test.variation', [
      "hello world",
      1234,
      1337
    ]);

    meta = new Container();

    meta.addTypeSignatureFromPayload(AnySignatures);
    meta.addTypeSignatureFromPayload(GeneralSignatures);
    meta.addTypeSignatureFromPayload(StringSignatures);
    meta.addTypeSignatureFromPayload(ListSignatures);
    meta.addTypeSignatureFromPayload(MapSignatures);
    meta.addTypeSignatureFromPayload(SubStringSignatures);
    meta.addTypeSignatureFromPayload(NotSearchableSignature);

    meta.excludeFromSearch('not-searchable');

    meta.addMetaFromPayload('en', EN);
  });

  test('should return signatures', () => {
    expect(meta.getTypeSignature('general').toJSON()).toEqual(Signature.parse(GeneralSignatures).toJSON());
  });

  test('should return any signature', () => {
    expect(meta.getDefinition(['general', 'string'], 'hasIndex').getArguments().map((item) => item.getLabel())).toEqual(AnySignatures.definitions.hasIndex.arguments.map((item) => item.label));
    expect(meta.getDefinition('any', 'hasIndex').getArguments().map((item) => item.getLabel())).toEqual(AnySignatures.definitions.hasIndex.arguments.map((item) => item.label));
  });

  test('should return description', () => {
    expect(meta.getDefinition('general', 'print').getDescription()).toEqual(EN.general.print.description);
  });

  test('should return example', () => {
    expect(meta.getDefinition('general', 'print').getExample()).toEqual(EN.general.print.example);
  });

  test('should return arg default', () => {
    expect(meta.getDefinition('general', 'print').getArgument('value').getDefault().value).toEqual('');
  });

  test('should return definition', () => {
    expect(meta.getDefinition(['string'], 'split').toJSON()).toMatchSnapshot();
  });

  test('should return variations', () => {
    expect(meta.getDefinition(['sub-string'], 'myProperty').getVariations()).toEqual([1, 'foo']);
  });

  test('should handle nested', () => {
    const definition = meta.getDefinition('general', 'nested');

    expect(definition.getArgument('value').getTypes()[0].toString()).toEqual("map<string,list<string>>");
    expect(definition.getReturns()[0].toString()).toEqual("list<list<number>>");
  });

  test('should return returnVariations', () => {
    expect(meta.getDefinition(['sub-string'], 'remove2').getReturnVariations()).toEqual([
      "hello world",
      1234,
      1337,
      123
    ]);
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

  test('should return no matches', () => {
    const result = meta.searchDefinitionMatches('not-searchable', 'hello');
    expect([...result.keys()]).toEqual([]);
  });

  test('should return two matches', () => {
    const result = meta.searchDefinitionMatches(['sub-string', 'string', 'general'], 'split');
    expect([...result.keys()]).toEqual(['sub-string', 'string']);
  });

  test('should return three matches from any', () => {
    const result = meta.searchDefinitionMatches('any', 'hasIndex');
    expect([...result.keys()]).toEqual(['string', 'list', 'map']);
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

    expect(result.getDefinition('general', 'print').getDescription()).toEqual('test');
    expect(meta.getDefinition('general', 'print').getDescription()).toEqual(EN.general.print.description);
  });

  test('should get all available tags', () => {
    const result = meta.getAvailableTags();

    expect(result).toEqual(['method', 'function', 'property']);
  });

  test('should get all signature definitions by identifier', () => {
    const result = meta.getDefinitionsById('hasIndex');

    expect(result.length).toEqual(5);
    expect(result.map((item) => item.getOrigin())).toEqual(['any', 'general', 'string', 'list', 'map']);
  });
});