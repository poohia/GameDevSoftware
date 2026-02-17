import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Dropdown, Form, Grid, Header } from 'semantic-ui-react';
import { TransComponent } from 'renderer/components';
import { useEvents } from 'renderer/hooks';
import { Button, Segment } from 'renderer/semantic-ui';
import DropDownFontsComponent from 'renderer/components/DropDownFontsComponent';
import { AssetType } from 'types';
import i18n from 'translations/i18n';

type ThemeValueType = 'string' | 'asset' | 'font' | 'color';
type ThemeData = Record<string, Record<string, string>>;

const getPathKey = (section: string, key: string) => `${section}.${key}`;

const detectValueType = (
  section: string,
  key: string,
  value?: string
): ThemeValueType => {
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value || '')) return 'color';
  if ((value || '').startsWith('@a:')) return 'asset';
  if ((value || '').startsWith('@f:')) return 'font';
  if (
    section.toLowerCase().includes('color') ||
    key.toLowerCase().includes('color')
  ) {
    return 'color';
  }
  if (
    section.toLowerCase().includes('font') ||
    key.toLowerCase().includes('font')
  ) {
    return 'font';
  }
  return 'string';
};

const stripFontPrefix = (value?: string) =>
  (value || '').startsWith('@f:') ? (value || '').replace('@f:', '') : value;

const withFontPrefix = (value?: string) => {
  const finalValue = value || '';
  if (!finalValue) return '';
  if (finalValue.startsWith('@f:')) return finalValue;
  return `@f:${finalValue}`;
};

const normalizeKeyDraftValue = (value?: string) =>
  (value || '').toLowerCase().replace(/\s+/g, '_');

const normalizeKeyFinalValue = (value?: string) =>
  normalizeKeyDraftValue(value).replace(/^_+|_+$/g, '');

const ThemePage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeData>({});
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [fieldTypes, setFieldTypes] = useState<Record<string, ThemeValueType>>(
    {}
  );
  const [keyDrafts, setKeyDrafts] = useState<Record<string, string>>({});
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [newKeyBySection, setNewKeyBySection] = useState<
    Record<string, string>
  >({});
  const [newTypeBySection, setNewTypeBySection] = useState<
    Record<string, ThemeValueType>
  >({});
  const [newValueBySection, setNewValueBySection] = useState<
    Record<string, string>
  >({});
  const hasLoadedThemeRef = useRef(false);
  const { on, requestMessage, sendMessage } = useEvents();

  const hydrateFieldTypes = useCallback((nextTheme: ThemeData) => {
    const nextFieldTypes: Record<string, ThemeValueType> = {};
    const nextKeyDrafts: Record<string, string> = {};
    Object.entries(nextTheme || {}).forEach(([section, values]) => {
      Object.entries(values || {}).forEach(([key, value]) => {
        const pathKey = getPathKey(section, key);
        nextFieldTypes[pathKey] = detectValueType(section, key, value);
        nextKeyDrafts[pathKey] = key;
      });
    });
    setFieldTypes(nextFieldTypes);
    setKeyDrafts(nextKeyDrafts);
  }, []);

  useEffect(() => {
    on('load-theme', (data: ThemeData) => {
      const nextTheme = data || {};
      setTheme((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(nextTheme)) {
          return prev;
        }
        return nextTheme;
      });
      hydrateFieldTypes(nextTheme);
      hasLoadedThemeRef.current = true;
    });
    requestMessage('load-assets', (data: AssetType[]) => {
      setAssets(data || []);
    });
    sendMessage('load-theme');
  }, [hydrateFieldTypes]);

  useEffect(() => {
    if (!hasLoadedThemeRef.current) return;
    sendMessage('set-theme', theme);
  }, [theme, sendMessage]);

  const onChangeValue = useCallback(
    (section: string, key: string, value?: string) => {
      const nextValue = value || '';
      setTheme((prev) => {
        const currentValue = prev?.[section]?.[key] || '';
        if (currentValue === nextValue) {
          return prev;
        }
        return {
          ...prev,
          [section]: {
            ...(prev[section] || {}),
            [key]: nextValue,
          },
        };
      });
    },
    []
  );

  const onChangeType = useCallback(
    (section: string, key: string, nextType: ThemeValueType) => {
      const pathKey = getPathKey(section, key);
      setFieldTypes((prev) => ({ ...prev, [pathKey]: nextType }));

      const currentValue = theme?.[section]?.[key] || '';
      if (nextType === 'asset') {
        if (!currentValue.startsWith('@a:')) {
          onChangeValue(section, key, '');
        }
        return;
      }
      if (nextType === 'font') {
        if (currentValue.startsWith('@a:')) {
          onChangeValue(section, key, '');
          return;
        }
        onChangeValue(section, key, withFontPrefix(currentValue));
        return;
      }
      if (nextType === 'color') {
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(currentValue)) {
          onChangeValue(section, key, currentValue);
          return;
        }
        onChangeValue(section, key, '#000000');
        return;
      }
      if (currentValue.startsWith('@a:')) {
        onChangeValue(section, key, currentValue.replace('@a:', ''));
        return;
      }
      if (currentValue.startsWith('@f:')) {
        onChangeValue(section, key, currentValue.replace('@f:', ''));
      }
    },
    [theme, onChangeValue]
  );

  const addSection = useCallback(() => {
    const section = newSectionName.trim();
    if (!section) return;

    setTheme((prev) => {
      if (prev[section]) return prev;
      return {
        ...prev,
        [section]: {},
      };
    });
    setNewSectionName('');
  }, [newSectionName]);

  const removeSection = useCallback((section: string) => {
    if (section === 'default') return;
    setTheme((prev) => {
      const nextTheme = { ...prev };
      delete nextTheme[section];
      return nextTheme;
    });
    setFieldTypes((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(
          ([pathKey]) => !pathKey.startsWith(`${section}.`)
        )
      )
    );
    setKeyDrafts((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(
          ([pathKey]) => !pathKey.startsWith(`${section}.`)
        )
      )
    );
  }, []);

  const addKeyInSection = useCallback(
    (section: string) => {
      if (section === 'default') return;
      const key = normalizeKeyFinalValue(newKeyBySection[section] || '');
      if (!key) return;

      const nextType = newTypeBySection[section] || 'string';
      const nextValueRaw = newValueBySection[section] || '';
      const nextValue =
        nextType === 'font' ? withFontPrefix(nextValueRaw) : nextValueRaw;

      setTheme((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          [key]: nextValue,
        },
      }));
      setFieldTypes((prev) => ({
        ...prev,
        [getPathKey(section, key)]: nextType,
      }));
      setKeyDrafts((prev) => ({
        ...prev,
        [getPathKey(section, key)]: key,
      }));
      setNewKeyBySection((prev) => ({ ...prev, [section]: '' }));
      setNewValueBySection((prev) => ({ ...prev, [section]: '' }));
      setNewTypeBySection((prev) => ({ ...prev, [section]: 'string' }));
    },
    [newKeyBySection, newTypeBySection, newValueBySection]
  );

  const removeKey = useCallback((section: string, key: string) => {
    if (section === 'default') return;
    setTheme((prev) => {
      const sectionValues = { ...(prev[section] || {}) };
      delete sectionValues[key];
      return {
        ...prev,
        [section]: sectionValues,
      };
    });
    setFieldTypes((prev) => {
      const next = { ...prev };
      delete next[getPathKey(section, key)];
      return next;
    });
    setKeyDrafts((prev) => {
      const next = { ...prev };
      delete next[getPathKey(section, key)];
      return next;
    });
  }, []);

  const renameKey = useCallback(
    (section: string, oldKey: string, rawNewKey: string) => {
      if (section === 'default') return;
      const newKey = normalizeKeyFinalValue(rawNewKey);
      if (!newKey || newKey === oldKey) {
        setKeyDrafts((prev) => ({
          ...prev,
          [getPathKey(section, oldKey)]: oldKey,
        }));
        return;
      }

      if (theme?.[section]?.[newKey] !== undefined) {
        setKeyDrafts((prev) => ({
          ...prev,
          [getPathKey(section, oldKey)]: oldKey,
        }));
        return;
      }

      setTheme((prev) => {
        const sectionValues = { ...(prev[section] || {}) };
        const currentValue = sectionValues[oldKey];
        delete sectionValues[oldKey];
        sectionValues[newKey] = currentValue;
        return {
          ...prev,
          [section]: sectionValues,
        };
      });

      setFieldTypes((prev) => {
        const oldPath = getPathKey(section, oldKey);
        const newPath = getPathKey(section, newKey);
        const oldType = prev[oldPath];
        const next = { ...prev };
        delete next[oldPath];
        if (oldType) {
          next[newPath] = oldType;
        }
        return next;
      });

      setKeyDrafts((prev) => {
        const oldPath = getPathKey(section, oldKey);
        const newPath = getPathKey(section, newKey);
        const next = { ...prev };
        delete next[oldPath];
        next[newPath] = newKey;
        return next;
      });
    },
    [theme]
  );

  const assetOptions = useMemo(
    () =>
      assets.map((asset) => ({
        key: asset.name,
        value: `@a:${asset.name}`,
        text: `${asset.name} (${asset.type})`,
      })),
    [assets]
  );

  return (
    <Container style={{ width: '60%', maxWidth: 1600 }}>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16} textAlign="center">
            <Header as="h1">
              <TransComponent id="module_theme" />
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <Header style={{ margin: '10px' }} as="h3">
                {i18n.t('module_theme_add_section')}
              </Header>
              <Form>
                <Grid>
                  <Grid.Row columns={2}>
                    <Grid.Column width={12}>
                      <Form.Input
                        label={i18n.t('module_theme_section_name')}
                        placeholder={i18n.t(
                          'module_theme_section_name_placeholder'
                        )}
                        value={newSectionName}
                        onChange={(_e, data) => setNewSectionName(data.value)}
                      />
                    </Grid.Column>
                    <Grid.Column width={4}>
                      <Form.Field>
                        <label>&nbsp;</label>
                        <Button fluid color="teal" onClick={addSection}>
                          {i18n.t('module_theme_add_section')}
                        </Button>
                      </Form.Field>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Form>
            </Segment>

            <Grid columns={1} stackable>
              {Object.entries(theme).map(([section, values]) => {
                const isDefaultSection = section === 'default';
                return (
                  <Grid.Column key={section} width={16}>
                    <Segment>
                      <Grid style={{ margin: '10px' }}>
                        <Grid.Row>
                          <Grid.Column width={12}>
                            <Header as="h3">{section}</Header>
                          </Grid.Column>
                          <Grid.Column width={4} textAlign="right">
                            {!isDefaultSection && (
                              <Button
                                color="red"
                                onClick={() => removeSection(section)}
                              >
                                {i18n.t('module_theme_delete_section')}
                              </Button>
                            )}
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                      <Form>
                        {!isDefaultSection && (
                          <Form.Group widths="equal">
                            <Form.Input
                              label={i18n.t('module_theme_new_key')}
                              placeholder={i18n.t(
                                'module_theme_new_key_placeholder'
                              )}
                              value={newKeyBySection[section] || ''}
                              onChange={(_e, data) =>
                                setNewKeyBySection((prev) => ({
                                  ...prev,
                                  [section]: normalizeKeyDraftValue(data.value),
                                }))
                              }
                            />
                            <Form.Field>
                              <label>{i18n.t('module_theme_type')}</label>
                              <Dropdown
                                fluid
                                selection
                                options={[
                                  {
                                    key: 'string',
                                    text: i18n.t('module_theme_type_string'),
                                    value: 'string',
                                  },
                                  {
                                    key: 'asset',
                                    text: i18n.t('module_theme_type_asset'),
                                    value: 'asset',
                                  },
                                  {
                                    key: 'font',
                                    text: i18n.t('module_theme_type_font'),
                                    value: 'font',
                                  },
                                  {
                                    key: 'color',
                                    text: i18n.t('module_theme_type_color'),
                                    value: 'color',
                                  },
                                ]}
                                value={newTypeBySection[section] || 'string'}
                                onChange={(_e, data) =>
                                  setNewTypeBySection((prev) => ({
                                    ...prev,
                                    [section]: data.value as ThemeValueType,
                                  }))
                                }
                              />
                            </Form.Field>
                            <Form.Field>
                              <label>
                                {i18n.t('module_theme_default_value')}
                              </label>
                              {(newTypeBySection[section] || 'string') ===
                              'asset' ? (
                                <Dropdown
                                  fluid
                                  selection
                                  clearable
                                  search
                                  placeholder={i18n.t(
                                    'module_theme_select_asset'
                                  )}
                                  options={assetOptions}
                                  value={
                                    newValueBySection[section] || undefined
                                  }
                                  onChange={(_e, data) =>
                                    setNewValueBySection((prev) => ({
                                      ...prev,
                                      [section]: (data.value as string) || '',
                                    }))
                                  }
                                />
                              ) : (newTypeBySection[section] || 'string') ===
                                'font' ? (
                                <DropDownFontsComponent
                                  value={stripFontPrefix(
                                    newValueBySection[section] || ''
                                  )}
                                  onChange={(_e, data) =>
                                    setNewValueBySection((prev) => ({
                                      ...prev,
                                      [section]: withFontPrefix(
                                        data.value as string
                                      ),
                                    }))
                                  }
                                />
                              ) : (newTypeBySection[section] || 'string') ===
                                'color' ? (
                                <input
                                  type="color"
                                  style={{
                                    width: '100%',
                                    minHeight: 40,
                                    border: '1px solid rgba(34,36,38,.15)',
                                    borderRadius: 4,
                                    padding: 4,
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                  }}
                                  value={
                                    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(
                                      newValueBySection[section] || ''
                                    )
                                      ? newValueBySection[section]
                                      : '#000000'
                                  }
                                  onChange={(_e, data) =>
                                    setNewValueBySection((prev) => ({
                                      ...prev,
                                      [section]: (data.value as string) || '#000000',
                                    }))
                                  }
                                />
                              ) : (
                                <Form.Input
                                  value={newValueBySection[section] || ''}
                                  onChange={(_e, data) =>
                                    setNewValueBySection((prev) => ({
                                      ...prev,
                                      [section]: data.value,
                                    }))
                                  }
                                />
                              )}
                            </Form.Field>
                            <Form.Field>
                              <label>&nbsp;</label>
                              <Button
                                fluid
                                color="teal"
                                onClick={() => addKeyInSection(section)}
                              >
                                {i18n.t('module_theme_add_key')}
                              </Button>
                            </Form.Field>
                          </Form.Group>
                        )}

                        {Object.entries(values || {}).map(([key, value]) => {
                          const pathKey = getPathKey(section, key);
                          const isDefaultKey = key === 'default';
                          const type =
                            fieldTypes[pathKey] ||
                            detectValueType(section, key, value);
                          return (
                            <Form.Group widths="equal" key={pathKey}>
                              <Form.Input
                                label={i18n.t('module_theme_key')}
                                value={keyDrafts[pathKey] ?? key}
                                disabled={isDefaultSection}
                                onChange={(_e, data) =>
                                  setKeyDrafts((prev) => ({
                                    ...prev,
                                    [pathKey]: normalizeKeyDraftValue(data.value),
                                  }))
                                }
                                onBlur={() =>
                                  renameKey(
                                    section,
                                    key,
                                    keyDrafts[pathKey] ?? key
                                  )
                                }
                              />
                              <Form.Field>
                                <label>{i18n.t('module_theme_type')}</label>
                                <Dropdown
                                  fluid
                                  selection
                                  disabled={isDefaultSection}
                                  options={[
                                    {
                                      key: 'string',
                                      text: i18n.t('module_theme_type_string'),
                                      value: 'string',
                                    },
                                    {
                                      key: 'asset',
                                      text: i18n.t('module_theme_type_asset'),
                                      value: 'asset',
                                    },
                                    {
                                      key: 'font',
                                      text: i18n.t('module_theme_type_font'),
                                      value: 'font',
                                    },
                                    {
                                      key: 'color',
                                      text: i18n.t('module_theme_type_color'),
                                      value: 'color',
                                    },
                                  ]}
                                  value={type}
                                  onChange={(_e, data) =>
                                    onChangeType(
                                      section,
                                      key,
                                      data.value as ThemeValueType
                                    )
                                  }
                                />
                              </Form.Field>
                              <Form.Field>
                                <label>{i18n.t('module_theme_value')}</label>
                                {type === 'asset' ? (
                                  <Dropdown
                                    fluid
                                    selection
                                    clearable
                                    search
                                    placeholder={i18n.t(
                                      'module_theme_select_asset'
                                    )}
                                    options={assetOptions}
                                    value={value || undefined}
                                    onChange={(_e, data) =>
                                      onChangeValue(
                                        section,
                                        key,
                                        data.value as string
                                      )
                                    }
                                  />
                                ) : type === 'font' ? (
                                  <DropDownFontsComponent
                                    value={stripFontPrefix(value)}
                                    onChange={(_e, data) =>
                                      onChangeValue(
                                        section,
                                        key,
                                        withFontPrefix(data.value as string)
                                      )
                                    }
                                  />
                                ) : type === 'color' ? (
                                  <input
                                    type="color"
                                    style={{
                                      width: '100%',
                                      minHeight: 40,
                                      border: '1px solid rgba(34,36,38,.15)',
                                      borderRadius: 4,
                                      padding: 4,
                                      backgroundColor: '#fff',
                                      cursor: 'pointer',
                                    }}
                                    value={
                                      /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value || '')
                                        ? value
                                        : '#000000'
                                    }
                                    onChange={(_e, data) =>
                                      onChangeValue(
                                        section,
                                        key,
                                        (data.value as string) || '#000000'
                                      )
                                    }
                                  />
                                ) : (
                                  <Form.Input
                                    value={value || ''}
                                    onChange={(_e, data) =>
                                      onChangeValue(
                                        section,
                                        key,
                                        data.value as string
                                      )
                                    }
                                  />
                                )}
                              </Form.Field>
                              <Form.Field>
                                <label>&nbsp;</label>
                                {!isDefaultSection && !isDefaultKey && (
                                  <Button
                                    color="red"
                                    onClick={() => removeKey(section, key)}
                                  >
                                    {i18n.t('module_theme_delete_row')}
                                  </Button>
                                )}
                              </Form.Field>
                            </Form.Group>
                          );
                        })}
                      </Form>
                    </Segment>
                  </Grid.Column>
                );
              })}
            </Grid>
            {Object.keys(theme).length === 0 && (
              <Segment textAlign="center">
                {i18n.t('module_theme_no_sections')}
              </Segment>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ThemePage;
