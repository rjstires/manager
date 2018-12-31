import { attr, fk, Model, } from 'redux-orm';

type Fields = Linode.Volume;

class Volume extends Model<Fields> {
}

Volume.modelName = 'volume';

Volume.fields = {
  id: attr(),
  label: attr(),
  status: attr(),
  size: attr(),
  region: fk('region'),
  linode_id: attr(), /** Update to FK. */
  created: attr(),
  updated: attr(),
  filesystem_path: attr(),
  recentEvent: attr(),
  tags: attr(), /** Update to many to many */
};

export default Volume;
