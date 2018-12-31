import { attr, Model } from 'redux-orm';

type Fields = Linode.Region;

class Region extends Model<Fields> {
}

Region.modelName = 'region';

Region.fields = {
  id: attr(),
  country: attr(),
};

export default Region;
