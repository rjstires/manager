import { lensPath, view } from 'ramda';
import { createSelector } from 'reselect';

export interface GroupedEntitiesForImport {
  linodes: GroupImportProps[];
  domains: GroupImportProps[];
}
export interface GroupImportProps {
  id: number;
  group?: string;
  label: string;
  tags: string[];
}

// Linodes and Domains are the only entities with Display Groups.
type GroupedEntity = Linode.Linode | Linode.Domain;

// Returns TRUE if "group" is NOT in "tags".
export const uniqueGroup = (entity: GroupedEntity) => entity.group && !entity.tags.includes(entity.group);

const L = {
  label: lensPath(['label']),
  domain: lensPath(['domain'])
}
// We're only interested in a subset of an entities properties for group import,
// so we extract them.
export const extractProps = (entity: GroupedEntity) => ({
  // As always, Domains don't have labels.
    label: view<GroupedEntity, string>(L.label, entity) || view<GroupedEntity, string>(L.domain, entity),
    id: entity.id,
    group: entity.group,
    tags: entity.tags
});


const linodeSelector = (state: ApplicationState) => state.__resources.linodes.entities;
const domainSelector = (state: ApplicationState) => state.__resources.domains.entities

// Selector that returns Linodes and Domains that have a GROUP without
// corresponding TAG.
export const entitiesWithGroupsToImport =
  createSelector<ApplicationState, Linode.Linode[], Linode.Domain[], GroupedEntitiesForImport>(
    linodeSelector, domainSelector,
    (linodes, domains) => {
      return {
        linodes: linodes.filter(uniqueGroup).map(extractProps),
        domains: domains.filter(uniqueGroup).map(extractProps)
      }
    }
  );

export default entitiesWithGroupsToImport;