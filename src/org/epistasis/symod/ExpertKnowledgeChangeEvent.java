package org.epistasis.symod;

import java.util.EventObject;

/**
 * Event object used to notify subscribers that an expert knowledge object has changed.
 */
public class ExpertKnowledgeChangeEvent extends EventObject {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/** Expert knowledge object which has changed. */
	private final ExpertKnowledge expert;

	/**
	 * Construct an ExpertKnowledgeChangeEvent.
	 * @param source object which fired the event
	 * @param expert expert knowledge object which has changed
	 */
	public ExpertKnowledgeChangeEvent(final Object source, final ExpertKnowledge expert) {
		super(source);
		this.expert = expert;
	}

	/**
	 * Get the expert knowledge object which has changed.
	 * @return expert knowledge object which has changed
	 */
	public ExpertKnowledge getExpertKnowledge() {
		return expert;
	}
}
