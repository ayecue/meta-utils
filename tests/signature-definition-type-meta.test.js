const { SignatureDefinitionTypeMeta } = require('../dist');

describe('signature-definition-type-meta', () => {
  test('should return simple type', () => {
    const type = new SignatureDefinitionTypeMeta({ type: 'test' });
    const parsed = SignatureDefinitionTypeMeta.fromString(type.toString())

    expect(type.toJSON()).toEqual(parsed.toJSON());
  });

  test('should return list type', () => {
    const type = new SignatureDefinitionTypeMeta({ type: 'list', valueType: 'test' });
    const parsed = SignatureDefinitionTypeMeta.fromString(type.toString())

    expect(type.toJSON()).toEqual(parsed.toJSON());
  });

  test('should return map type', () => {
    const type = new SignatureDefinitionTypeMeta({ type: 'map', keyType: 'test', valueType: 'test' });
    const parsed = SignatureDefinitionTypeMeta.fromString(type.toString())

    expect(type.toJSON()).toEqual(parsed.toJSON());
  });

  test('should fail returning type', () => {
    const parsed = SignatureDefinitionTypeMeta.fromString('map<string,string,string>')

    expect(parsed).toEqual(null);
  });
});