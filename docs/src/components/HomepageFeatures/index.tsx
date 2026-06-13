import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Typed Contracts',
    description: (
      <>
        Document, Chunk, RetrievalResult, and PipelineResult are typed and
        immutable. Every pipeline stage receives and returns objects whose
        shape is guaranteed, not assumed.
      </>
    ),
  },
  {
    title: 'Explicit Failure Modes',
    description: (
      <>
        Empty retrieval, score collapse, context truncation, and embedding
        model mismatch are named, catchable types, not silent quality
        degradation discovered after the fact.
      </>
    ),
  },
  {
    title: 'Cost Accountability',
    description: (
      <>
        Every result carries a CostReport with tokens, latency, and estimated
        cost per stage, so quality and cost tradeoffs are visible before the
        bill arrives.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
