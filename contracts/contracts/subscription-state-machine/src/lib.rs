#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contractevent, Env, String};

#[contract]
pub struct SubscriptionStateMachine;

/// Subscription states
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum SubscriptionState {
    Active = 0,
    PendingRenewal = 1,
    Paused = 2,
    Failed = 3,
    Canceled = 4,
}

/// Event emitted when subscription state changes
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StateChangeEvent {
    pub subscription_id: String,
    pub old_state: SubscriptionState,
    pub new_state: SubscriptionState,
    pub timestamp: u64,
}

/// Subscription data stored in contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Subscription {
    pub id: String,
    pub state: SubscriptionState,
    pub created_at: u64,
    pub updated_at: u64,
}

#[contractimpl]
impl SubscriptionStateMachine {
    /// Initialize a new subscription with ACTIVE state
    pub fn create_subscription(env: Env, subscription_id: String) -> Subscription {
        // Check if subscription already exists
        let key = subscription_id.clone();
        if env.storage().persistent().has(&key) {
            panic!("Subscription already exists");
        }

        let timestamp = env.ledger().timestamp();
        let subscription = Subscription {
            id: subscription_id.clone(),
            state: SubscriptionState::Active,
            created_at: timestamp,
            updated_at: timestamp,
        };

        // Store subscription using persistent storage with subscription_id as key
        env.storage().persistent().set(&key, &subscription);

        // Emit initial state event
        StateChangeEvent {
            subscription_id: subscription_id.clone(),
            old_state: SubscriptionState::Active, // No previous state for new subscription
            new_state: SubscriptionState::Active,
            timestamp,
        }
        .publish(&env);

        subscription
    }

    /// Get subscription by ID
    pub fn get_subscription(env: Env, subscription_id: String) -> Option<Subscription> {
        let key = subscription_id;
        env.storage().persistent().get(&key)
    }

    /// Transition subscription to PENDING_RENEWAL state
    /// Valid transitions: ACTIVE -> PENDING_RENEWAL
    pub fn transition_to_pending_renewal(env: Env, subscription_id: String) -> Subscription {
        Self::transition_state(
            env,
            subscription_id,
            SubscriptionState::PendingRenewal,
            &[SubscriptionState::Active],
        )
    }

    /// Transition subscription to PAUSED state
    /// Valid transitions: ACTIVE -> PAUSED, PENDING_RENEWAL -> PAUSED
    pub fn transition_to_paused(env: Env, subscription_id: String) -> Subscription {
        Self::transition_state(
            env,
            subscription_id,
            SubscriptionState::Paused,
            &[SubscriptionState::Active, SubscriptionState::PendingRenewal],
        )
    }

    /// Transition subscription to FAILED state
    /// Valid transitions: PENDING_RENEWAL -> FAILED
    pub fn transition_to_failed(env: Env, subscription_id: String) -> Subscription {
        Self::transition_state(
            env,
            subscription_id,
            SubscriptionState::Failed,
            &[SubscriptionState::PendingRenewal],
        )
    }

    /// Transition subscription to CANCELED state
    /// Valid transitions: ACTIVE -> CANCELED, PENDING_RENEWAL -> CANCELED, PAUSED -> CANCELED, FAILED -> CANCELED
    pub fn transition_to_canceled(env: Env, subscription_id: String) -> Subscription {
        Self::transition_state(
            env,
            subscription_id,
            SubscriptionState::Canceled,
            &[
                SubscriptionState::Active,
                SubscriptionState::PendingRenewal,
                SubscriptionState::Paused,
                SubscriptionState::Failed,
            ],
        )
    }

    /// Resume subscription from PAUSED to ACTIVE
    /// Valid transitions: PAUSED -> ACTIVE
    pub fn resume_from_paused(env: Env, subscription_id: String) -> Subscription {
        Self::transition_state(
            env,
            subscription_id,
            SubscriptionState::Active,
            &[SubscriptionState::Paused],
        )
    }

    /// Retry failed subscription back to PENDING_RENEWAL
    /// Valid transitions: FAILED -> PENDING_RENEWAL
    pub fn retry_from_failed(env: Env, subscription_id: String) -> Subscription {
        Self::transition_state(
            env,
            subscription_id,
            SubscriptionState::PendingRenewal,
            &[SubscriptionState::Failed],
        )
    }

    /// Complete renewal and return to ACTIVE
    /// Valid transitions: PENDING_RENEWAL -> ACTIVE
    pub fn complete_renewal(env: Env, subscription_id: String) -> Subscription {
        Self::transition_state(
            env,
            subscription_id,
            SubscriptionState::Active,
            &[SubscriptionState::PendingRenewal],
        )
    }

    /// Internal helper function to validate and perform state transitions
    fn transition_state(
        env: Env,
        subscription_id: String,
        new_state: SubscriptionState,
        valid_from_states: &[SubscriptionState],
    ) -> Subscription {
        let key = subscription_id.clone();
        let mut subscription: Subscription = env
            .storage()
            .persistent()
            .get(&key)
            .expect("Subscription not found");

        // Check if transition from CANCELED state (terminal state)
        if subscription.state == SubscriptionState::Canceled {
            panic!("Cannot transition from CANCELED state");
        }

        // Check if transition to same state
        if subscription.state == new_state {
            panic!("Already in target state");
        }

        // Validate transition
        let old_state = subscription.state;
        let is_valid = valid_from_states.iter().any(|&state| state == old_state);

        if !is_valid {
            panic!("Invalid state transition");
        }

        // Perform transition
        let timestamp = env.ledger().timestamp();
        subscription.state = new_state;
        subscription.updated_at = timestamp;

        // Store updated subscription
        env.storage().persistent().set(&key, &subscription);

        // Emit state change event
        StateChangeEvent {
            subscription_id: subscription_id.clone(),
            old_state,
            new_state,
            timestamp,
        }
        .publish(&env);

        subscription
    }
}

mod test;

