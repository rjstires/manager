import { attr, fk, Model } from 'redux-orm';

type Fields = Linode.LinodeType;

class Type extends Model<Fields> {
}

Type.modelName = 'Type';

Type.fields = {
  id: attr(),
  disk: attr(),
  class: attr(),
  price: attr(),
  successor: fk('Type'),
  label: attr(),
  addons: attr(),
  network_out: attr(),
  memory: attr(),
  transfer: attr(),
  vcpus: attr(),
};

export default Type;
