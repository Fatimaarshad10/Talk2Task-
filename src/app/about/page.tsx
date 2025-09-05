'use client'

import { Rocket, Target, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Talk2Task</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Transforming your ideas into actions with the power of AI.
        </p>
      </motion.div>

      <div className="space-y-16">
        {/* Our Mission */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center gap-8"
        >
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">
              <Target className="inline-block w-8 h-8 text-accent mr-3" />
              Our Mission
            </h2>
            <p className="text-muted leading-relaxed">
              Our mission is to streamline productivity for professionals and teams. We believe that
              great ideas shouldn't get lost in translation. Talk2Task is designed to be an
              intuitive bridge between your thoughts and tangible outcomes, allowing you to focus on
              what truly matters: innovation and execution.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-64 h-64 bg-surface rounded-full flex items-center justify-center border border-border shadow-lg">
              <Rocket className="w-32 h-32 text-accent" />
            </div>
          </div>
        </motion.div>

        {/* What We Do */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row-reverse items-center gap-8"
        >
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">
              <Zap className="inline-block w-8 h-8 text-accent mr-3" />
              What We Do
            </h2>
            <p className="text-muted leading-relaxed">
              Talk2Task is an AI-powered assistant that intelligently converts your voice notes and
              text inputs into structured tasks, project plans, and summaries. By integrating with
              your favorite tools, we ensure a seamless workflow from brainstorming to completion.
              Whether you're a solo entrepreneur or part of a large enterprise, Talk2Task adapts to
              your needs, helping you stay organized and efficient.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-64 h-64 bg-surface rounded-2xl flex items-center justify-center border border-border shadow-lg p-8">
              <img src="/file.svg" alt="Productivity" className="w-48 h-48" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
