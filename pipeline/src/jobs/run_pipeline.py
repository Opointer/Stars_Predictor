from __future__ import annotations

from src.config.settings import get_settings
from src.db.connection import get_connection
from src.evaluation.metrics import write_metrics
from src.features.builder import build_features
from src.ingestion.nhl_api import load_nhl_dataset
from src.ingestion.repository import (
    complete_model_run,
    create_model_run,
    initialize_schema,
    load_base_tables,
    reset_database,
)
from src.models.baseline import score_predictions


def main() -> None:
    settings = get_settings()
    dataset = load_nhl_dataset(settings.team_abbreviation, settings.recent_lookback_days)

    with get_connection(settings.database_url) as connection:
        initialize_schema(connection)
        reset_database(connection)
        load_base_tables(connection, dataset.teams, dataset.games)
        model_run_id = create_model_run(connection, settings.model_version)
        build_features(connection, settings.feature_version)
        score_predictions(connection, settings.model_version, settings.feature_version, settings.home_ice_advantage)
        write_metrics(connection, model_run_id, settings.model_version)
        complete_model_run(connection, model_run_id)

    print(
        "Pipeline completed: schema initialized, NHL data loaded, "
        f"{dataset.recent_game_count} recent final games and {dataset.upcoming_game_count} upcoming {settings.team_abbreviation} games ingested, "
        "features generated, predictions scored, metrics written."
    )


if __name__ == "__main__":
    main()
