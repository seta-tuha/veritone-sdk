/* FRAGMENTS */
export const entityFieldsFragment = `
  fragment entityFields on Entity {
    id
    name
    libraryId
    library {
      id
      name
    }
    profileImageUrl
  }
`;

/* QUERIES */
export const getEngineResultsQuery = `
  query engineResults($tdoId: ID!, $engineIds: [ID!]!, $startOffsetMs: Int, $stopOffsetMs: Int, $ignoreUserEdited: Boolean) {
    engineResults(tdoId: $tdoId, engineIds: $engineIds, startOffsetMs: $startOffsetMs, stopOffsetMs: $stopOffsetMs, ignoreUserEdited: $ignoreUserEdited) {
      records {
        tdoId
        engineId
        startOffsetMs
        stopOffsetMs
        jsondata
      }
    }
  }`;

export const getLibrariesByType = `
  query libraries($type: String) {
    libraries(type: $type) {
      records {
        id
        name
        libraryType {
          id
          label
          entityTypeName
        }
      }
    }
  }`;

export const getLibrariesByIdentifierType = `
  query libraries($entityIdentifierTypeIds: [String!]) {
    libraries(limit:500, entityIdentifierTypeIds: $entityIdentifierTypeIds) {
      records {
        id
        name
        libraryType {
          id
          label
          entityTypeName
        }
      }
    }
  }`;

export const createLibrary = `
  mutation CreateLibrary($input: CreateLibrary!) {
    createLibrary(input: $input) {
      id
      name
    }
  }  
`;

export const createEntity = `
  ${entityFieldsFragment}
  mutation CreateEntity($input: CreateEntity!) {
    entity: createEntity(input: $input) {
      ...entityFields
      jsondata
    }
  }
`;

export const searchForEntities = `
  ${entityFieldsFragment}
  query SearchForEntities($type: String, $name: String) {
    libraries(type: $type) {
      records {
        entities(name: $name) {
          records {
            ...entityFields
          }
        }
      }
    }
  }`;
