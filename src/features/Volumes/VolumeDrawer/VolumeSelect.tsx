import * as React from 'react';
import { compose } from 'recompose';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import volumesContainer, { Props as WithVolumesProps } from 'src/containers/volumes.container';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  error?: string;
  onChange: (linodeId: number) => void;
  name: string;
  onBlur: (e: any) => void;
  value: number;
  region: string;
}

interface State {
  volumes: Item[];
  selectedVolumeId?: number;
}

type CombinedProps = Props & WithVolumesProps & WithStyles<ClassNames>;

class VolumeSelect extends React.Component<CombinedProps, State> {

  state: State = {
    volumes: [],
  };

  componentDidMount() {
    this.searchVolumes();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { region } = this.props;
    if (region !== prevProps.region) {
      this.searchVolumes();
    }
  }

  getSelectedVolume = (linodeId?: number) => {
    if (!linodeId) { return -1; }

    const { volumes } = this.state;
    const idx = volumes.findIndex((linode) => Number(linodeId) === Number(linode.value));
    return idx > -1 ? volumes[idx] : -1;
  }

  setSelectedVolume = (selected: Item<number>) => {
    if (selected) {
      const { value } = selected;
      this.setState({ selectedVolumeId: value });
      this.props.onChange(value);
    } else {
      this.props.onChange(-1);
      this.setState({ selectedVolumeId: -1 })
    }
  }

  renderLinodeOptions = (volumes: Linode.Volume[]) => {
    if (!volumes) { return []; }
    return volumes.map(volume => ({
      value: volume.id,
      label: volume.label,
      data: {
        region: volume.region
      },
    }));
  }

  searchVolumes = (inputValue: string = '') => {
    const { volumesData } = this.props;

    if (inputValue === '') {
      return this.setState({
        volumes: this.renderLinodeOptions(volumesData),
      })
    }

    const results = volumesData.filter((volume) => {
      return volume.region !== null && volume.region.includes(inputValue)
        || volume.label.includes(inputValue);
    });

    this.setState({ volumes: this.renderLinodeOptions(results) });
  }

  onInputChange = (inputValue: string, actionMeta: { action: string }) => {
    /**
     * I've added menu-close to prevent stale search results from being displayed on the
     * next open.
     */
    if (!['input-change', 'menu-close'].includes(actionMeta.action)) { return; }
    this.searchVolumes(inputValue);
  }

  render() {
    const { error, name, onBlur } = this.props;
    const { volumes, selectedVolumeId } = this.state;

    return (
      <FormControl fullWidth>
        <EnhancedSelect
          onBlur={onBlur}
          name={name}
          label="Volume"
          placeholder="Select a Volume"
          value={this.getSelectedVolume(selectedVolumeId)}
          errorText={error}
          options={volumes}
          onChange={this.setSelectedVolume}
          onInputChange={this.onInputChange}
        />
        {!error && <FormHelperText data-qa-volume-region>Only volumes in this Linode's region are displayed.</FormHelperText>}
      </FormControl>
    );
  }
};

const styled = withStyles(styles);

const withVolumes = volumesContainer<WithVolumesProps, Props>(({ data, loading, error }, ownProps) => ({
  volumesData: data
    .filter(v => v.linode_id === null && v.region === ownProps.region),
  volumesError: error,
  volumesLoading: loading,
}));

const enhanced = compose<CombinedProps, Props>(
  styled,
  withVolumes,
);

export default enhanced(VolumeSelect);
