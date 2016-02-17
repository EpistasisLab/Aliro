package org.epistasis.symod;

import java.util.EventListener;

/**
 * Listener interface to implement for subscribing to ExpertKnowledgeChangeEvent's.
 */
public interface ExpertKnowledgeChangeListener extends EventListener {
	/**
	 * Callback which is called when the expert knowledge in question is changed.
	 * @param e event object containing information about this event
	 */
	public void expertKnowledgeChange(ExpertKnowledgeChangeEvent e);
}
