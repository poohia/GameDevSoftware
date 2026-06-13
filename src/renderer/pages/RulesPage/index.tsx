import { Container, Grid, Header, List } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { Segment } from 'renderer/semantic-ui';

const CODE_BLOCK_STYLE = {
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
  fontFamily: 'Menlo, Monaco, Consolas, monospace',
  fontSize: '0.9rem',
  lineHeight: 1.5,
};

const POSSIBLE_TYPES_EXAMPLE = `"string"
"translation"
"number"
"float"
"boolean"
"image"
"sound"
"video"
"json"
"scene"
"@go:type"
"@c:constantKey"
"@a:assetType"
"@s:type"
`;

const ROOT_STRUCTURE_EXAMPLE = `{
  "name": "Dialogue",
  "type": "dialogue",
  "description": "create dialogue",
  "_inheritance": "baseType@key1,key2",
  "core": {
    "fieldName": "string"
  }
}`;

const FIELD_RULES_EXAMPLE = `{
  "uniqueKey": "string",
  "name": {
    "core": "translation",
    "optional": true
  },
  "texts": {
    "core": {
      "content": "translation"
    },
    "multiple": true
  },
  "character": "@go:character",
  "animation": "@c:animations",
  "sound": "sound",
  "order": {
    "core": "number",
    "optional": true
  }
}`;

const DIALOGUE_EXAMPLE = `{
  "name": "Dialogue",
  "type": "dialogue",
  "description": "create dialogue",
  "core": {
    "character": "@go:character",
    "animation": "@c:animations",
    "texts": {
      "core": {
        "content": "translation",
        "unlockNoteInspecteur": {
          "core": {
            "noteInspecteur": "@go:noteInspecteur"
          },
          "multiple": true,
          "optional": true
        },
        "unlockScenario": {
          "core": {
            "scenario": "@go:scenario"
          },
          "multiple": true,
          "optional": true
        },
        "unlockTexts": {
          "core": {
            "text": "@go:gameTexts"
          },
          "multiple": true,
          "optional": true
        },
        "unlockCharacter": {
          "core": {
            "character": "@go:character"
          },
          "multiple": true,
          "optional": true
        }
      },
      "multiple": true,
      "optional": false
    },
    "sound": "sound",
    "responses": {
      "multiple": true,
      "core": "@go:response"
    },
    "canShowHistoryResponses": "boolean"
  }
}`;

const INHERITANCE_EXAMPLE = `{
  "name": "Item",
  "type": "item",
  "description": "Item ou objet dans le jeu",
  "core": {
    "uniqueKey": "string",
    "name": {
      "core": "translation",
      "optional": true
    },
    "texts": {
      "core": {
        "content": "translation"
      },
      "optional": true,
      "multiple": true
    },
    "images": {
      "optional": true,
      "multiple": true,
      "core": {
        "content": "image"
      }
    },
    "gameObjectTarget": {
      "core": "@go:",
      "optional": true
    },
    "order": {
      "core": "number",
      "optional": true
    }
  }
}

{
  "name": "Potion",
  "type": "potion",
  "_inheritance": "item@uniqueKey,name,order",
  "core": {
    "potionValue": "string"
  }
}`;

const RulesPage: React.FC = () => {
  return (
    <Container fluid>
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h1">{i18n.t('module_rules')}</Header>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            <Segment className="game-dev-software-module-application-params-identity-segment">
              <span className="game-dev-software-module-application-params-identity-segment-title">
                Types possibles
              </span>
              <List bulleted>
                <List.Item>
                  Types primitifs autorises: `"string"`, `"translation"`,
                  `"number"`, `"float"`, `"boolean"`, `"image"`, `"sound"`,
                  `"video"`, `"json"` et `"scene"`.
                </List.Item>
                <List.Item>
                  `"float"` est un type de config valide, meme si au final il
                  devient un `number` en TypeScript.
                </List.Item>
                <List.Item>
                  Les references speciales peuvent commencer par `@go:`, `@c:`,
                  `@a:`, `@s:` ou `@t:` selon ce qu on veut pointer.
                </List.Item>
                <List.Item>
                  `@go:` sert a referencer un type de gameobject.
                </List.Item>
                <List.Item>
                  `@c:` sert a referencer une constante existante.
                </List.Item>
                <List.Item>`@a:` sert a referencer un asset.</List.Item>
                <List.Item>`@s:` sert a referencer une scene.</List.Item>
                <List.Item>
                  `@t:` sert a referencer une cle de traduction ou une valeur de
                  traduction.
                </List.Item>
              </List>
              <pre style={CODE_BLOCK_STYLE}>{POSSIBLE_TYPES_EXAMPLE}</pre>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            <Segment className="game-dev-software-module-application-params-identity-segment">
              <span className="game-dev-software-module-application-params-identity-segment-title">
                Structure de base
              </span>
              <p>
                Cette page sert de memo pour les fichiers JSON de definition de
                type gameobject ou scene. Le fonctionnement est le meme: un
                objet racine avec `name`, `type`, `description`, `core` et, si
                besoin, `_inheritance`.
              </p>
              <pre style={CODE_BLOCK_STYLE}>{ROOT_STRUCTURE_EXAMPLE}</pre>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            <Segment className="game-dev-software-module-application-params-identity-segment">
              <span className="game-dev-software-module-application-params-identity-segment-title">
                Regles principales
              </span>
              <List bulleted>
                <List.Item>`name` est le nom lisible du type.</List.Item>
                <List.Item>
                  `type` est la cle technique utilisee pour identifier le type
                  partout.
                </List.Item>
                <List.Item>
                  `description` aide a comprendre l intention du type et sert
                  aussi de contexte pour ChatGPT.
                </List.Item>
                <List.Item>
                  `core` contient la vraie definition des champs.
                </List.Item>
                <List.Item>
                  Un champ peut etre directement une valeur simple comme
                  `"string"`, `"number"`, `"boolean"`, `"translation"`,
                  `"sound"`, `"image"`, `"video"`, `"json"` ou `"scene"`.
                </List.Item>
                <List.Item>
                  Si un champ a besoin de metadata, il devient un objet avec au
                  minimum `core`, et eventuellement `optional` ou `multiple`.
                </List.Item>
                <List.Item>
                  Les references de type `@go:character` ou `@c:animations`
                  restent des conventions valides dans le JSON.
                </List.Item>
                <List.Item>
                  Les objets imbriques se construisent en mettant un `core`
                  objet, puis en appliquant `optional` et `multiple` au bon
                  niveau.
                </List.Item>
              </List>
              <pre style={CODE_BLOCK_STYLE}>{FIELD_RULES_EXAMPLE}</pre>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            <Segment className="game-dev-software-module-application-params-identity-segment">
              <span className="game-dev-software-module-application-params-identity-segment-title">
                Regles d&apos;inheritance
              </span>
              <List bulleted>
                <List.Item>
                  `_inheritance: "item"` reprend tout le `core` top-level du
                  type parent `item`, puis fusionne avec le `core` local.
                </List.Item>
                <List.Item>
                  `_inheritance: "item@uniqueKey,name"` reprend uniquement les
                  cles listees depuis `item.core`, puis fusionne avec le `core`
                  local.
                </List.Item>
                <List.Item>
                  Si une cle existe dans le parent et dans l enfant, la
                  definition locale gagne.
                </List.Item>
                <List.Item>
                  On herite du contenu du `core` parent, pas de `name`,
                  `description` ou d autres metadata racine.
                </List.Item>
              </List>
              <pre style={CODE_BLOCK_STYLE}>{INHERITANCE_EXAMPLE}</pre>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            <Segment className="game-dev-software-module-application-params-identity-segment">
              <span className="game-dev-software-module-application-params-identity-segment-title">
                Exemple complet
              </span>
              <p>
                Exemple de type complet avec objets imbriques, tableaux,
                references `@go:` et constante `@c:`.
              </p>
              <pre style={CODE_BLOCK_STYLE}>{DIALOGUE_EXAMPLE}</pre>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default RulesPage;
