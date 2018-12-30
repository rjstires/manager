import { attr, fk, Model } from 'redux-orm';

interface Fields {
  id: string;
  disk: number;
  class: Linode.LinodeTypeClass;
  price: Linode.PriceObject;
  successor: string | null;
  label: string;
  addons: {
    backups: { price: Linode.PriceObject };
  };
  network_out: number;
  memory: number;
  transfer: number;
  vcpus: number;
}

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
