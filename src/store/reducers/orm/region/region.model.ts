import { attr, Model } from 'redux-orm';

interface Fields {
  id: string;
  country: string;
}

class Region extends Model<Fields> {
}

Region.modelName = 'Region';

Region.fields = {
  id: attr(),
  country: attr(),
};

export default Region;
