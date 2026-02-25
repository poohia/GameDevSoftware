import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Container,
  Dropdown,
  Form,
  Grid,
  Header,
  Icon,
} from 'semantic-ui-react';
import { TransComponent } from 'renderer/components';
import { useDatabase, useEvents } from 'renderer/hooks';
import { Button, Segment } from 'renderer/semantic-ui';
import DropDownFontsComponent from 'renderer/components/DropDownFontsComponent';
import { AssetType } from 'types';
import i18n from 'translations/i18n';
import { ChromePicker } from 'react-color';

type ThemeValueType = 'string' | 'asset' | 'font' | 'color';
type ThemeValue = string | null;
type ThemeData = Record<string, Record<string, ThemeValue>>;
type ThemeFieldConstraint = {
  section: string;
  key: string;
  type: ThemeValueType;
  allowNull?: boolean;
};
type ColorPickerState = {
  id: string;
  mode: 'new' | 'edit';
  section: string;
  key?: string;
} | null;

const THEME_FIELD_CONSTRAINTS: ThemeFieldConstraint[] = [
  {
    section: 'default_button',
    key: 'background_image',
    type: 'asset',
    allowNull: true,
  },
  {
    section: 'default_button',
    key: 'background_image_active',
    type: 'asset',
    allowNull: true,
  },
  {
    section: 'default_modal',
    key: 'background_image',
    type: 'asset',
    allowNull: true,
  },
];

const getPathKey = (section: string, key: string) => `${section}.${key}`;
const getThemeFieldConstraint = (section: string, key: string) =>
  THEME_FIELD_CONSTRAINTS.find(
    (constraint) => constraint.section === section && constraint.key === key
  );

const detectValueType = (
  section: string,
  key: string,
  value?: ThemeValue
): ThemeValueType => {
  const constraint = getThemeFieldConstraint(section, key);
  if (constraint) return constraint.type;
  if ((value || '').startsWith('@c:')) return 'color';
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value || '')) return 'color';
  if ((value || '').startsWith('@a:')) return 'asset';
  if ((value || '').startsWith('@f:')) return 'font';
  return 'string';
};

const stripFontPrefix = (value?: ThemeValue) => {
  const finalValue = value || '';
  return finalValue.startsWith('@f:')
    ? finalValue.replace('@f:', '')
    : finalValue;
};

const withFontPrefix = (value?: string) => {
  const finalValue = value || '';
  if (!finalValue) return '';
  if (finalValue.startsWith('@f:')) return finalValue;
  return `@f:${finalValue}`;
};

const stripColorPrefix = (value?: ThemeValue) => {
  const finalValue = value || '';
  return finalValue.startsWith('@c:')
    ? finalValue.replace('@c:', '')
    : finalValue;
};

const withColorPrefix = (value?: string) => {
  const finalValue = value || '';
  if (!finalValue) return '';
  if (finalValue.startsWith('@c:')) return finalValue;
  return `@c:${finalValue}`;
};

const normalizeKeyDraftValue = (value?: string) =>
  (value || '').toLowerCase().replace(/\s+/g, '_');

const normalizeKeyFinalValue = (value?: string) =>
  normalizeKeyDraftValue(value).replace(/^_+|_+$/g, '');

const normalizeSectionDraftValue = (value?: string) =>
  (value || '').toLowerCase().replace(/\s+/g, '_');

const normalizeSectionFinalValue = (value?: string) =>
  normalizeSectionDraftValue(value).replace(/^_+|_+$/g, '');

const THEME_SECTIONS_OPEN_DB_KEY = 'themepage-sections-open';
const buildColorPickerId = (
  mode: 'new' | 'edit',
  section: string,
  key: string = ''
) => `${mode}__${section}__${key}`;
const normalizeDisplayColorValue = (value?: ThemeValue) => {
  const v = stripColorPrefix(value) || '';
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : '#000000';
};
const getReadableTextAndBorderColor = (backgroundColor: string) => {
  const hex = backgroundColor.replace('#', '');
  const normalizedHex =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : hex;

  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? 'black' : 'white';
};
const isSectionLockedByEditable = (values?: Record<string, ThemeValue>) => {
  const editableValue = values?.editable;
  if (editableValue === false) return true;
  if (typeof editableValue === 'string') {
    return editableValue.toLowerCase() === 'false';
  }
  return false;
};

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
  const [activeColorPicker, setActiveColorPicker] =
    useState<ColorPickerState>(null);
  const [colorDraft, setColorDraft] = useState<string>('#000000');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const hasLoadedThemeRef = useRef(false);
  const savedOpenSectionsRef = useRef<Record<string, boolean>>({});
  const [hasLoadedOpenSections, setHasLoadedOpenSections] =
    useState<boolean>(false);
  const { on, requestMessage, sendMessage } = useEvents();
  const { getItem, setItem } = useDatabase();

  const persistOpenSections = useCallback(
    (next: Record<string, boolean>) => {
      setItem(THEME_SECTIONS_OPEN_DB_KEY, next);
    },
    [setItem]
  );

  const hydrateFieldTypes = useCallback((nextTheme: ThemeData) => {
    const nextFieldTypes: Record<string, ThemeValueType> = {};
    const nextKeyDrafts: Record<string, string> = {};
    Object.entries(nextTheme || {}).forEach(([section, values]) => {
      Object.entries(values || {}).forEach(([key, value]) => {
        if (key === 'editable') return;
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
      setAssets((data || []).filter((a) => a.type === 'image'));
    });
    sendMessage('load-theme');
  }, [hydrateFieldTypes]);

  useEffect(() => {
    if (!hasLoadedThemeRef.current) return;
    sendMessage('set-theme', theme);
  }, [theme, sendMessage]);

  useEffect(() => {
    const savedOpenSections =
      getItem<Record<string, boolean>>(THEME_SECTIONS_OPEN_DB_KEY) || {};
    savedOpenSectionsRef.current = savedOpenSections;
    setOpenSections(savedOpenSections);
    setHasLoadedOpenSections(true);
  }, [getItem]);

  useEffect(() => {
    if (!hasLoadedOpenSections) return;
    setOpenSections((prev) => {
      const sectionNames = Object.keys(theme || {});
      const baseOpenSections =
        Object.keys(prev).length === 0 ? savedOpenSectionsRef.current : prev;
      const next = sectionNames.reduce<Record<string, boolean>>(
        (acc, sectionName) => {
          acc[sectionName] = !!baseOpenSections[sectionName];
          return acc;
        },
        {}
      );
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }
      persistOpenSections(next);
      return next;
    });
  }, [theme, persistOpenSections, hasLoadedOpenSections]);

  const toggleSection = useCallback(
    (section: string) => {
      setOpenSections((prev) => {
        const next = {
          ...prev,
          [section]: !prev[section],
        };
        persistOpenSections(next);
        return next;
      });
    },
    [persistOpenSections]
  );

  const onChangeValue = useCallback(
    (section: string, key: string, value?: ThemeValue) => {
      const nextValue = value === undefined ? '' : value;
      setTheme((prev) => {
        const currentValue = prev?.[section]?.[key] ?? '';
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

  const openColorPicker = useCallback(
    (params: {
      mode: 'new' | 'edit';
      section: string;
      key?: string;
      value?: ThemeValue;
    }) => {
      setColorDraft(normalizeDisplayColorValue(params.value));
      setActiveColorPicker({
        id: buildColorPickerId(params.mode, params.section, params.key),
        mode: params.mode,
        section: params.section,
        key: params.key,
      });
    },
    []
  );

  const closeColorPicker = useCallback(
    (commit: boolean = true) => {
      if (!activeColorPicker) return;

      if (commit) {
        if (activeColorPicker.mode === 'new') {
          setNewValueBySection((prev) => ({
            ...prev,
            [activeColorPicker.section]: withColorPrefix(colorDraft),
          }));
        } else if (activeColorPicker.key) {
          onChangeValue(
            activeColorPicker.section,
            activeColorPicker.key,
            withColorPrefix(colorDraft)
          );
        }
      }

      setActiveColorPicker(null);
    },
    [activeColorPicker, colorDraft, onChangeValue]
  );

  useEffect(() => {
    if (!activeColorPicker) return;

    const onDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(`[data-color-picker-id="${activeColorPicker.id}"]`)) {
        return;
      }
      closeColorPicker(true);
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, [activeColorPicker, closeColorPicker]);

  const onChangeType = useCallback(
    (section: string, key: string, nextType: ThemeValueType) => {
      const constraint = getThemeFieldConstraint(section, key);
      const finalType = constraint?.type || nextType;
      const pathKey = getPathKey(section, key);
      setFieldTypes((prev) => ({ ...prev, [pathKey]: finalType }));

      if (constraint) {
        return;
      }

      if (finalType === 'color') {
        onChangeValue(section, key, '@c:#000000');
        return;
      }
      onChangeValue(section, key, '');
    },
    [onChangeValue]
  );

  const addSection = useCallback(() => {
    const section = normalizeSectionFinalValue(newSectionName);
    if (!section) return;

    setTheme((prev) => {
      if (prev[section]) return prev;
      return {
        ...prev,
        [section]: {},
      };
    });
    setOpenSections((prev) => {
      const next = { ...prev, [section]: false };
      persistOpenSections(next);
      return next;
    });
    setNewSectionName('');
  }, [newSectionName, persistOpenSections]);

  const removeSection = useCallback(
    (section: string) => {
      if (isSectionLockedByEditable(theme?.[section])) return;
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
      setOpenSections((prev) => {
        const next = { ...prev };
        delete next[section];
        persistOpenSections(next);
        return next;
      });
    },
    [persistOpenSections, theme]
  );

  const addKeyInSection = useCallback(
    (section: string) => {
      if (isSectionLockedByEditable(theme?.[section])) return;
      const key = normalizeKeyFinalValue(newKeyBySection[section] || '');
      if (!key) return;

      const constraint = getThemeFieldConstraint(section, key);
      const nextType =
        constraint?.type || newTypeBySection[section] || 'string';
      const nextValueRaw = newValueBySection[section] || '';
      const nextValue =
        nextType === 'font'
          ? withFontPrefix(nextValueRaw)
          : nextType === 'color'
          ? withColorPrefix(nextValueRaw || '#000000')
          : nextType === 'asset' && constraint?.allowNull && !nextValueRaw
          ? null
          : nextValueRaw;

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
    [newKeyBySection, newTypeBySection, newValueBySection, theme]
  );

  const removeKey = useCallback(
    (section: string, key: string) => {
      if (isSectionLockedByEditable(theme?.[section])) return;
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
    },
    [theme]
  );

  const renameKey = useCallback(
    (section: string, oldKey: string, rawNewKey: string) => {
      if (isSectionLockedByEditable(theme?.[section])) return;
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
        text: `${asset.name}`,
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
                        onChange={(_e, data) =>
                          setNewSectionName(
                            normalizeSectionDraftValue(data.value)
                          )
                        }
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
                const isSectionLocked = isSectionLockedByEditable(values);
                const isSectionOpen = !!openSections[section];
                return (
                  <Grid.Column key={section} width={16}>
                    <Segment>
                      <Grid style={{ margin: '10px' }}>
                        <Grid.Row>
                          <Grid.Column
                            width={12}
                            onClick={() => toggleSection(section)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Header as="h3">
                              <Icon
                                name={
                                  isSectionOpen ? 'angle down' : 'angle right'
                                }
                              />
                              {section}
                            </Header>
                          </Grid.Column>
                          <Grid.Column width={4} textAlign="right">
                            {!isSectionLocked && (
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
                      {isSectionOpen && (
                        <Form>
                          {!isSectionLocked && (
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
                                    [section]: normalizeKeyDraftValue(
                                      data.value
                                    ),
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
                                  value={
                                    getThemeFieldConstraint(
                                      section,
                                      normalizeKeyFinalValue(
                                        newKeyBySection[section] || ''
                                      )
                                    )?.type ||
                                    newTypeBySection[section] ||
                                    'string'
                                  }
                                  disabled={
                                    !!getThemeFieldConstraint(
                                      section,
                                      normalizeKeyFinalValue(
                                        newKeyBySection[section] || ''
                                      )
                                    )
                                  }
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
                                {(getThemeFieldConstraint(
                                  section,
                                  normalizeKeyFinalValue(
                                    newKeyBySection[section] || ''
                                  )
                                )?.type ||
                                  newTypeBySection[section] ||
                                  'string') === 'asset' ? (
                                  <Dropdown
                                    fluid
                                    selection
                                    search
                                    clearable={
                                      !!getThemeFieldConstraint(
                                        section,
                                        normalizeKeyFinalValue(
                                          newKeyBySection[section] || ''
                                        )
                                      )?.allowNull
                                    }
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
                                ) : (getThemeFieldConstraint(
                                    section,
                                    normalizeKeyFinalValue(
                                      newKeyBySection[section] || ''
                                    )
                                  )?.type ||
                                    newTypeBySection[section] ||
                                    'string') === 'font' ? (
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
                                ) : (getThemeFieldConstraint(
                                    section,
                                    normalizeKeyFinalValue(
                                      newKeyBySection[section] || ''
                                    )
                                  )?.type ||
                                    newTypeBySection[section] ||
                                    'string') === 'color' ? (
                                  <div
                                    style={{ position: 'relative' }}
                                    data-color-picker-id={buildColorPickerId(
                                      'new',
                                      section
                                    )}
                                  >
                                    <div
                                      className="ui input"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() =>
                                        openColorPicker({
                                          mode: 'new',
                                          section,
                                          value: newValueBySection[section],
                                        })
                                      }
                                    >
                                      <input
                                        readOnly
                                        value={normalizeDisplayColorValue(
                                          newValueBySection[section]
                                        )}
                                        style={(() => {
                                          const bg = normalizeDisplayColorValue(
                                            newValueBySection[section]
                                          );
                                          const fg =
                                            getReadableTextAndBorderColor(bg);
                                          return {
                                            backgroundColor: bg,
                                            color: fg,
                                            border: `1px solid ${fg}`,
                                          };
                                        })()}
                                      />
                                    </div>
                                    {activeColorPicker?.id ===
                                      buildColorPickerId('new', section) && (
                                      <div
                                        style={{
                                          position: 'absolute',
                                          zIndex: 20,
                                          marginTop: 8,
                                        }}
                                      >
                                        <ChromePicker
                                          disableAlpha
                                          color={colorDraft}
                                          onChange={(color) =>
                                            setColorDraft(
                                              color.hex || '#000000'
                                            )
                                          }
                                        />
                                      </div>
                                    )}
                                  </div>
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

                          {Object.entries(values || {})
                            .filter(([key]) => key !== 'editable')
                            .map(([key, value]) => {
                              const pathKey = getPathKey(section, key);
                              const fieldConstraint = getThemeFieldConstraint(
                                section,
                                key
                              );
                              const type =
                                fieldConstraint?.type ||
                                fieldTypes[pathKey] ||
                                detectValueType(section, key, value);
                              return (
                                <Form.Group widths="equal" key={pathKey}>
                                  <Form.Input
                                    label={i18n.t('module_theme_key')}
                                    value={keyDrafts[pathKey] ?? key}
                                    disabled={isSectionLocked}
                                    onChange={(_e, data) =>
                                      setKeyDrafts((prev) => ({
                                        ...prev,
                                        [pathKey]: normalizeKeyDraftValue(
                                          data.value
                                        ),
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
                                      disabled={
                                        isSectionLocked || !!fieldConstraint
                                      }
                                      options={[
                                        {
                                          key: 'string',
                                          text: i18n.t(
                                            'module_theme_type_string'
                                          ),
                                          value: 'string',
                                        },
                                        {
                                          key: 'asset',
                                          text: i18n.t(
                                            'module_theme_type_asset'
                                          ),
                                          value: 'asset',
                                        },
                                        {
                                          key: 'font',
                                          text: i18n.t(
                                            'module_theme_type_font'
                                          ),
                                          value: 'font',
                                        },
                                        {
                                          key: 'color',
                                          text: i18n.t(
                                            'module_theme_type_color'
                                          ),
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
                                    <label>
                                      {i18n.t('module_theme_value')}
                                    </label>
                                    {type === 'asset' ? (
                                      <Dropdown
                                        fluid
                                        selection
                                        search
                                        clearable={!!fieldConstraint?.allowNull}
                                        placeholder={i18n.t(
                                          'module_theme_select_asset'
                                        )}
                                        options={assetOptions}
                                        value={value ?? undefined}
                                        onChange={(_e, data) =>
                                          onChangeValue(
                                            section,
                                            key,
                                            (data.value as string | null) ??
                                              (fieldConstraint?.allowNull
                                                ? null
                                                : '')
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
                                      <div
                                        style={{ position: 'relative' }}
                                        data-color-picker-id={buildColorPickerId(
                                          'edit',
                                          section,
                                          key
                                        )}
                                      >
                                        <div
                                          className="ui input"
                                          style={{
                                            cursor: 'pointer',
                                          }}
                                          onClick={() =>
                                            openColorPicker({
                                              mode: 'edit',
                                              section,
                                              key,
                                              value,
                                            })
                                          }
                                        >
                                          <input
                                            readOnly
                                            value={normalizeDisplayColorValue(
                                              value
                                            )}
                                            style={(() => {
                                              const bg =
                                                normalizeDisplayColorValue(
                                                  value
                                                );
                                              const fg =
                                                getReadableTextAndBorderColor(
                                                  bg
                                                );
                                              return {
                                                backgroundColor: bg,
                                                color: fg,
                                                border: `1px solid ${fg}`,
                                              };
                                            })()}
                                          />
                                        </div>
                                        {activeColorPicker?.id ===
                                          buildColorPickerId(
                                            'edit',
                                            section,
                                            key
                                          ) && (
                                          <div
                                            style={{
                                              position: 'absolute',
                                              zIndex: 20,
                                              marginTop: 8,
                                            }}
                                          >
                                            <ChromePicker
                                              disableAlpha
                                              color={colorDraft}
                                              onChange={(color) =>
                                                setColorDraft(
                                                  color.hex || '#000000'
                                                )
                                              }
                                            />
                                          </div>
                                        )}
                                      </div>
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
                                    {!isSectionLocked && (
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
                      )}
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
