import React, { PropTypes } from 'react';
import _ from 'lodash';

import Distribution from './Distribution';

export default function Distributions(props) {
  const { distributions, distribution, onSelected, noDistribution = true } = props;

  if (!Object.values(distributions).length) {
    return null;
  }

  const vendorsUnsorted = _.map(
    _.groupBy(Object.values(distributions), d => d.vendor),
    (v, k) => ({
      name: k,
      versions: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
    })
  );

  const vendorByName = name =>
    vendorsUnsorted.find(v => v.name.toLowerCase().indexOf(name) !== -1);

  const vendors = [
    vendorByName('ubuntu'),
    vendorByName('debian'),
    vendorByName('centos'),
    vendorByName('fedora'),
    vendorByName('arch'),
    vendorByName('opensuse'),
    vendorByName('gentoo'),
    vendorByName('slackware'),
  ];

  return (
    <div className="LinodesDistributions">
      {vendors.map(v =>
        <div className="LinodesDistributions-wrapper" key={v.name}>
          <Distribution
            selected={distribution}
            vendor={v}
            onClick={onSelected}
          />
        </div>)}
        {!noDistribution ? null : (
          <div className="LinodesDistributions-wrapper">
            <Distribution
              noDistribution
              selected={distribution}
              onClick={onSelected}
            />
          </div>)}
    </div>
  );
}

Distributions.propTypes = {
  distributions: PropTypes.object.isRequired,
  distribution: PropTypes.string,
  onSelected: PropTypes.func.isRequired,
  noDistribution: PropTypes.bool,
};
