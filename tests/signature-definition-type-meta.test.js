const { SignatureDefinitionTypeMeta, SignatureDefinitionBaseType } = require('../dist');

describe('signature-definition-type-meta', () => {
  test('should return simple type', () => {
    const type = new SignatureDefinitionTypeMeta({ type: 'test' });
    const parsed = SignatureDefinitionTypeMeta.fromString(type.toString());

    expect(type.toJSON()).toEqual(parsed.toJSON());
  });

  test('should return list type', () => {
    const type = SignatureDefinitionTypeMeta.parseValueObject({ type: 'list', valueType: 'test' });
    const parsed = SignatureDefinitionTypeMeta.fromString(type.toString());

    expect(type.toJSON()).toEqual(parsed.toJSON());
  });

  test('should return map type', () => {
    const type = SignatureDefinitionTypeMeta.parseValueObject({ type: 'map', keyType: 'test', valueType: 'test' });
    const parsed = SignatureDefinitionTypeMeta.fromString(type.toString())

    expect(type.toJSON()).toEqual(parsed.toJSON());
  });

  test('should parse nested types', () => {
    const type = SignatureDefinitionTypeMeta.parseValueObject({
      type: 'list',
      valueType: {
        type: 'map',
        keyType: 'string',
        valueType: {
          type: 'map',
          keyType: 'string',
          valueType: {
            type: 'list',
            valueType: {
              type: 'list',
              valueType: 'string'
            }
          }
        }
      }
    });
    const parsed = SignatureDefinitionTypeMeta.fromString(type.toString());

    expect(type.toJSON()).toEqual(parsed.toJSON());
  });

  test('should fail returning any type', () => {
    const parsed = SignatureDefinitionTypeMeta.fromString('map<string,string,string>')

    expect(parsed.type).toEqual(SignatureDefinitionBaseType.Any);
  });
});